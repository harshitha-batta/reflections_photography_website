document.addEventListener("DOMContentLoaded", () => {
  const likeBox = document.querySelector(".like-box");
  const likeNotification = document.getElementById("like-notification");

  // Function to show the notification
  function showLikeNotification(message, duration = 3000) {
    likeNotification.textContent = message; // Set message text
    likeNotification.classList.add("show"); // Make it visible

    // Hide after duration
    setTimeout(() => {
      likeNotification.classList.remove("show");
    }, duration);
  }

  if (likeBox) {
    likeBox.addEventListener("click", async () => {
      const photoId = likeBox.getAttribute("data-photo-id");
      const likeCount = document.getElementById("like-count");

      try {
        const response = await fetch(`/like/${photoId}`, { method: "POST" });

        if (response.ok) {
          const result = await response.json();

          // Toggle the liked class and update count
          likeBox.classList.toggle("liked", result.liked);
          likeCount.textContent = result.likesCount;
        } else {
          showLikeNotification("Join Reflections to like this photo! 💛");
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        showLikeNotification("Uh-oh! Something went wrong. Please try again. 🌐");
      }
    });
  }
});

