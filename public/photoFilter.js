document.addEventListener("DOMContentLoaded", () => {
  // Get dropdown and all gallery items
  const dropdown = document.getElementById("explore-dropdown");
  const galleryItems = document.querySelectorAll(".gallery-item");

  // Function to reset and display all photos initially
  function resetGallery() {
    galleryItems.forEach((item) => {
      item.style.display = "block"; // Show all photos
    });
  }

  // Event listener for dropdown selection
  dropdown.addEventListener("change", (event) => {
    const selectedCategory = event.target.value;

    // Loop through all gallery items and filter
    galleryItems.forEach((item) => {
      const itemCategory = item.getAttribute("data-category");
      if (!selectedCategory || itemCategory === selectedCategory) {
        item.style.display = "block"; // Show matching photos
      } else {
        item.style.display = "none"; // Hide non-matching photos
      }
    });
  });

  // Show all photos on initial page load
  resetGallery();
});
