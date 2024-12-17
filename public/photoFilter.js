document.addEventListener("DOMContentLoaded", () => {
  const dropdown = document.getElementById("explore-dropdown"); // Dropdown element
  const galleryItems = document.querySelectorAll(".gallery-item"); // All gallery items

  // Function to filter gallery items
  function filterGallery(selectedCategory) {
    galleryItems.forEach((item) => {
      const itemCategory = item.getAttribute("data-category");

      if (selectedCategory === "all" || itemCategory === selectedCategory) {
        item.style.display = "block"; // Show all or matching items
      } else {
        item.style.display = "none"; // Hide non-matching items
      }
    });

    // Update dropdown value to reflect the current category
    dropdown.value = selectedCategory;
  }

  // Event listener for dropdown selection
  dropdown.addEventListener("change", (event) => {
    const selectedCategory = event.target.value; // Get the selected dropdown value
    filterGallery(selectedCategory); // Filter the gallery items
  });

  // Initialize gallery: Show all photos on page load
  filterGallery("all");
});
