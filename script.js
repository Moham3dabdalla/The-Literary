function toggleSearch() {
  const input = document.getElementById("search-input");
  input.classList.toggle("active");
  if (input.classList.contains("active")) {
    input.focus();
  } else {
    input.value = "";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const booksContainer = document.getElementById("books-container");
  const searchInput = document.getElementById("search-input");
  const paginationContainer = document.getElementById("pagination");
  const languageDropdown = document.getElementById("language-dropdown");
  const booksSectionHeader = document.querySelector("h1"); // استهداف h1 آخر الكتب المضافة

  let booksData = [];
  let currentPage = 1;
  const booksPerPage = 5;

  fetch("./books.json")
    .then(response => response.json())
    .then(data => {
      booksData = data.books.reverse(); // ترتيب عكسي للأحدث
      restoreState();
    })
    .catch(error => console.error("Error loading books:", error));

  function displayBooks() {
    booksContainer.innerHTML = "";
    localStorage.setItem("currentPage", currentPage); // حفظ الصفحة الحالية

    const startIndex = (currentPage - 1) * booksPerPage;
    const selectedBooks = booksData.slice(startIndex, startIndex + booksPerPage);

    if (selectedBooks.length === 0) {
      booksContainer.innerHTML = `<p>No books found.</p>`;
      return;
    }

    selectedBooks.forEach(book => {
      let translationText = book.translation.arabic && book.translation.english
        ? "Arabic & English version"
        : book.translation.arabic
        ? "النسخة العربية فقط"
        : "النسخة الانجليزية فقط";

      const bookSection = document.createElement("div");
      bookSection.classList.add("featured-article");
      bookSection.innerHTML = `
        <div class="featured-article-grid">
          ${book.photo ? `<div><img src="${book.photo}" alt="Book Image" class="book-image"></div>` : ""}
          <div class="featured-article-content">
            <span class="category-tag-trans">${translationText}</span>
            ${book.licence ? `<span class="category-tag-copy">© مرخص: لا يمكنك إعادة استخدام أو نسخ محتوى هذا الكتاب بأي شكل من الأشكال<br> مملوك من قِبل: ${book.author} </span>` : ""}
            <h3 class="article-title">${book.title}</h3>
            <p class="article-excerpt">${book.description || "No description available."}</p>
            <a href="info.html?id=${book.id}" class="read-more-book" data-id="${book.id}">اقرأ المزيد عن الكتاب</a>
            <div class="article-meta">
              الكاتب: <span class="author">${book.author}</span> • ${book.Date}
              <br>
              ${book.contact ? `<span class="contact">Contact: <a href="mailto:${book.contact}">${book.contact}</a></span>` : ""}
              <br>
              ${book.prize ? `<span class="prize">Prize: <a>${book.prize}</a></span>` : ""}
            </div>
            <a href="${book.url}" class="read-more">
               تحميل الكتاب
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon">
                <path d="M19 12H5" />
                <path d="m12 5-7 7 7 7" />
              </svg>
            </a>
          </div>
        </div>
      `;
      booksContainer.appendChild(bookSection);
    });

    // حفظ آخر كتاب تم فتحه عند الضغط عليه
    document.querySelectorAll(".read-more-book").forEach(link => {
      link.addEventListener("click", (event) => {
        const bookId = event.target.dataset.id;
        localStorage.setItem("lastBookId", bookId);
      });
    });
  }

  function updatePagination() {
    paginationContainer.innerHTML = "";

    const totalPages = Math.ceil(booksData.length / booksPerPage);
    if (totalPages <= 1) return;

    const prevButton = document.createElement("button");
    prevButton.textContent = "السابق";
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        displayBooks();
        updatePagination();
        scrollToBooksSectionHeader(); // التمرير إلى h1
      }
    });

    const nextButton = document.createElement("button");
    nextButton.textContent = "التالي";
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener("click", () => {
      if (currentPage < totalPages) {
        currentPage++;
        displayBooks();
        updatePagination();
        scrollToBooksSectionHeader(); // التمرير إلى h1
      }
    });

    paginationContainer.appendChild(prevButton);
    paginationContainer.appendChild(nextButton);
  }

  // دالة لتمرير الصفحة إلى h1
  function scrollToBooksSectionHeader() {
    if (booksSectionHeader) {
      booksSectionHeader.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function restoreState() {
    const savedPage = localStorage.getItem("currentPage");
    if (savedPage) {
      currentPage = parseInt(savedPage);
    }

    const savedSearch = localStorage.getItem("searchQuery");
    if (savedSearch) {
      searchInput.value = savedSearch;
      booksData = booksData.filter(book =>
        book.title.toLowerCase().includes(savedSearch.toLowerCase()) || 
        book.author.toLowerCase().includes(savedSearch.toLowerCase())
      );
    }

    displayBooks();
    updatePagination();
  }

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    localStorage.setItem("searchQuery", query);
    booksData = booksData.filter(book =>
      book.title.toLowerCase().includes(query) || book.author.toLowerCase().includes(query)
    );
    currentPage = 1;
    displayBooks();
    updatePagination();
  });
});
