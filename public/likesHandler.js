document.addEventListener("DOMContentLoaded", () => {
  const likeBox = document.querySelector(".like-box");

  if (likeBox) {
    likeBox.addEventListener("click", async () => {
      const photoId = likeBox.getAttribute("data-photo-id");
      const likeCount = document.getElementById("like-count");

      try {
        const response = await fetch(`/like/${photoId}`, { method: "POST" });

        if (response.ok) {
          const result = await response.json(); 

          likeBox.classList.toggle("liked", result.liked);
          likeCount.textContent = result.likesCount;
        } else {
          alert("Join Reflections to like this photo!");
        }
      } catch (err) {
        console.error("Uh-oh! An unexpected error occurred. Please check your connection and try again. 🌐", err);
      }
    });
  }
});
