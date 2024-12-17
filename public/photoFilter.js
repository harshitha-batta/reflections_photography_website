document.addEventListener("DOMContentLoaded", () => {
  // Select dropdown and all gallery items
  const dropdown = document.getElementById("explore-dropdown");
  const galleryItems = document.querySelectorAll(".gallery-item");

  // Event listener to filter photos based on dropdown selection
  dropdown.addEventListener("change", (event) => {
    const selectedCategory = event.target.value; // Get the selected value from dropdown

    // Loop through all gallery items
    galleryItems.forEach((item) => {
      const itemCategory = item.getAttribute("data-category"); // Get the item's category

      // Show or hide photos based on the selected category
      if (!selectedCategory || itemCategory === selectedCategory) {
        item.style.display = "block"; // Show matching photos
      } else {
        item.style.display = "none"; // Hide non-matching photos
      }
    });
  });
});
