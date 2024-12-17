document.addEventListener("DOMContentLoaded", () => {
  const dropdown = document.getElementById("explore-dropdown");
  const galleryItems = document.querySelectorAll(".gallery-item");

  // Function to filter gallery items
  function filterGallery(selectedCategory) {
    galleryItems.forEach((item) => {
      const itemCategory = item.getAttribute("data-category");

      if (selectedCategory === "all" || itemCategory === selectedCategory) {
        item.style.display = "block"; // Show matching or all items
      } else {
        item.style.display = "none"; // Hide non-matching items
      }
    });

    // Set dropdown value to the selected category
    dropdown.value = selectedCategory;
  }

  // Event listener for dropdown selection
  dropdown.addEventListener("change", (event) => {
    const selectedCategory = event.target.value.toLowerCase();
    filterGallery(selectedCategory);
  });

  // Initialize gallery to show all photos
  filterGallery("all");
});
