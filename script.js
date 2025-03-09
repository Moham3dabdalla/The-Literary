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
  const paginationContainer = document.getElementById("pagination"); // عنصر الترقيم
  const languageDropdown = document.getElementById("language-dropdown");

  let booksData = [];
  let currentLanguage = localStorage.getItem("selectedLanguage") || "en";
  let currentPage = 1;
  const booksPerPage = 10; // عدد الكتب في كل صفحة

  // تحديث القائمة المنسدلة عند التحميل
  languageDropdown.value = currentLanguage;
  document.documentElement.lang = currentLanguage;
  document.documentElement.dir = currentLanguage === "ar" ? "rtl" : "ltr";

  const translations = {
    en: {
      arabicEnglish: "Arabic & English version",
      arabicOnly: "Arabic version only",
      englishOnly: "English version only",
      licence: "© Licensed: You cannot reuse or copy the content of this book in any way",
      download: "Download The Book",
      contact: "Contact",
      noBooks: "No books found.",
      searchPlaceholder: "Search Book...",
      previous: "Previous",
      next: "Next"
    },
    ar: {
      arabicEnglish: "النسخة العربية والإنجليزية",
      arabicOnly: "النسخة العربية فقط",
      englishOnly: "النسخة الإنجليزية فقط",
      licence: "© مرخص: لا يمكنك إعادة استخدام أو نسخ محتوى هذا الكتاب بأي شكل من الأشكال",
      download: "تحميل الكتاب",
      contact: "التواصل",
      noBooks: "لم يتم العثور على كتب.",
      searchPlaceholder: "ابحث عن كتاب...",
      previous: "السابق",
      next: "التالي"
    }
  };

  // تحميل البيانات
  fetch("books.json")
    .then(response => response.json())
    .then(data => {
      booksData = data.books;
      displayBooks();
      updatePagination();
    })
    .catch(error => console.error("Error loading books:", error));

  // عرض الكتب بناءً على الصفحة الحالية
  function displayBooks() {
    booksContainer.innerHTML = "";

    const startIndex = (currentPage - 1) * booksPerPage;
    const selectedBooks = booksData.slice(startIndex, startIndex + booksPerPage);

    if (selectedBooks.length === 0) {
      booksContainer.innerHTML = `<p>${translations[currentLanguage].noBooks}</p>`;
      return;
    }

    selectedBooks.forEach(book => {
      let translationText = book.translation.arabic && book.translation.english
        ? translations[currentLanguage].arabicEnglish
        : book.translation.arabic
        ? translations[currentLanguage].arabicOnly
        : translations[currentLanguage].englishOnly;

      const bookSection = document.createElement("div");
      bookSection.classList.add("featured-article");
      bookSection.innerHTML = `
        <div class="featured-article-grid">
          <div class="featured-article-content">
            <span class="category-tag-trans">${translationText}</span>
            ${book.licence ? `<span class="category-tag-copy">${translations[currentLanguage].licence}</span>` : ""}
            <h3 class="article-title">${book.title}</h3>
            <p class="article-excerpt">${book.description || translations[currentLanguage].noBooks}</p>
            <div class="article-meta">
              By: <span class="author">${book.author}</span> • ${book.Date}
              <br>
              <span class="contact">${translations[currentLanguage].contact}: <a href="mailto:${book.contact}">${book.contact}</a></span>
            </div>
            <a href="${book.url}" class="read-more">
              ${translations[currentLanguage].download}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      `;
      booksContainer.appendChild(bookSection);
    });
  }

  // تحديث أزرار الترقيم
  function updatePagination() {
    paginationContainer.innerHTML = "";

    const totalPages = Math.ceil(booksData.length / booksPerPage);
    if (totalPages <= 1) return;

    const prevButton = document.createElement("button");
    prevButton.textContent = translations[currentLanguage].previous;
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        displayBooks();
        updatePagination();
      }
    });

    const nextButton = document.createElement("button");
    nextButton.textContent = translations[currentLanguage].next;
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener("click", () => {
      if (currentPage < totalPages) {
        currentPage++;
        displayBooks();
        updatePagination();
      }
    });

    paginationContainer.appendChild(prevButton);
    paginationContainer.appendChild(nextButton);
  }

  // البحث أثناء الكتابة
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    booksData = booksData.filter(book =>
      book.title.toLowerCase().includes(query) || book.author.toLowerCase().includes(query)
    );
    currentPage = 1;
    displayBooks();
    updatePagination();
  });

  // تحديث النصوص عند تغيير اللغة
  window.addEventListener("languageChange", (event) => {
    currentLanguage = event.detail;
    searchInput.placeholder = translations[currentLanguage].searchPlaceholder;
    displayBooks();
    updatePagination();
  });
});