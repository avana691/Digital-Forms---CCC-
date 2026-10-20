
const images = document.querySelectorAll(
  ".clutter-img-container .clutter-img"
);

const radius = 400;
const maxDistance = 400;
const smoothing = 0.07;

let mouseX = -10000;
let mouseY = -10000;

// Save each image's original position ONCE
const imageData = Array.from(images, (img) => {
  const rect = img.getBoundingClientRect();

  return {
    img,
    originX: rect.left + rect.width / 2,
    originY: rect.top + rect.height / 2,
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0
  };
});

// Track the cursor across the entire viewport
window.addEventListener("mousemove", (event) => {
  mouseX = event.clientX;
  mouseY = event.clientY;
});

// Let images settle back when the cursor leaves the window
document.addEventListener("mouseleave", () => {
  mouseX = -10000;
  mouseY = -10000;
});

window.addEventListener("blur", () => {
  mouseX = -10000;
  mouseY = -10000;
});

function animate() {
  imageData.forEach((item) => {
    // Always calculate from the original position,
    // never from the image's current moving position.
    const dx = item.originX - mouseX;
    const dy = item.originY - mouseY;
    const distance = Math.hypot(dx, dy);

    if (distance < radius && distance > 0) {
      const force = (1 - distance / radius) ** 2;

      item.targetX = (dx / distance) * maxDistance * force;
      item.targetY = (dy / distance) * maxDistance * force;
    } else {
      item.targetX = 0;
      item.targetY = 0;
    }

    // Smoothly approach the target and settle there
    item.x += (item.targetX - item.x) * smoothing;
    item.y += (item.targetY - item.y) * smoothing;

    // Avoid endless microscopic movement
    if (Math.abs(item.targetX - item.x) < 0.05) {
      item.x = item.targetX;
    }

    if (Math.abs(item.targetY - item.y) < 0.05) {
      item.y = item.targetY;
    }

    item.img.style.setProperty("--scatter-x", `${item.x}px`);
    item.img.style.setProperty("--scatter-y", `${item.y}px`);
  });

  requestAnimationFrame(animate);
}

animate();


/* ========================================
   TEXT BLOCKS: SCROLL-DIRECTION ANIMATION
======================================== */

document.querySelectorAll(".viewport").forEach((viewport) => {
    let lastX = viewport.scrollLeft;
    let lastY = viewport.scrollTop;
    let scrollDirection = "right";

    viewport.addEventListener("scroll", () => {
        const currentX = viewport.scrollLeft;
        const currentY = viewport.scrollTop;

        if (currentX !== lastX) {
            scrollDirection = currentX > lastX ? "right" : "left";
        }

        if (currentY !== lastY) {
            scrollDirection = currentY > lastY ? "down" : "up";
        }

        lastX = currentX;
        lastY = currentY;
    }, { passive: true });

    const blocks = viewport.querySelectorAll(
        ".page1-container p, .page2-container p, .page3-container p"
    );

    if (!blocks.length) {
        console.warn("No text blocks found inside this viewport:", viewport);
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            const el = entry.target;

            // Choose the entrance direction
            const horizontal =
                scrollDirection === "right" ? "60px" :
                scrollDirection === "left" ? "-60px" : "0px";

            const vertical =
                scrollDirection === "down" ? "60px" :
                scrollDirection === "up" ? "-60px" : "0px";

            el.style.setProperty("--enter-x", horizontal);
            el.style.setProperty("--enter-y", vertical);

            // Start from the offset position
            el.classList.remove("is-visible");

            // Apply the visible state on the next frame
            requestAnimationFrame(() => {
                el.classList.add("is-visible");
            });

            observer.unobserve(el);
        });
    }, {
        root: viewport,
        threshold: 0.01
    });

    blocks.forEach((block) => observer.observe(block));
});