
const images = document.querySelectorAll(
  ".clutter-img-container .clutter-img"
);

const radius = 400;
const maxDistance = 300;
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

(() => {
    const container = document.querySelector('.letters-container');
    if (!container) return;

    let startX = 0, startY = 0, startT = 0, downOnLetter = false;

    // capture phase, so it runs even if main.js stops the event
    window.addEventListener('pointerdown', (e) => {
        downOnLetter = !!e.target.closest('.letters-container img');
        startX = e.clientX;
        startY = e.clientY;
        startT = performance.now();
    }, true);

    window.addEventListener('pointerup', (e) => {
        if (!downOnLetter) return;
        downOnLetter = false;

        const moved = Math.hypot(e.clientX - startX, e.clientY - startY);
        const quick = performance.now() - startT < 400;

        // a tap or click, not a drag
        if (moved < 6 && quick && e.target.closest('.letters-container img')) {
            window.location.href = 'about.html';
        }
    }, true);
})();



const imgs = [...document.querySelectorAll('.clutter2-img-container .clutter-img')];

if (imgs.length) {
    document.body.classList.add('clutter2-pending');

    let started = false;

    function clearClutter() {
        if (started) return;
        started = true;

        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const far = Math.hypot(window.innerWidth, window.innerHeight);

        const anims = imgs.map((img) => {
            const r = img.getBoundingClientRect();
            let dx = r.left + r.width / 2 - cx;
            let dy = r.top + r.height / 2 - cy;

            if (Math.abs(dx) < 1 && Math.abs(dy) < 1) {
                const a = Math.random() * Math.PI * 2;
                dx = Math.cos(a);
                dy = Math.sin(a);
            }

            const len = Math.hypot(dx, dy);
            const dist = far + Math.max(r.width, r.height);

            return img.animate(
                {
                    translate: `${(dx / len) * dist}px ${(dy / len) * dist}px`,
                    opacity: 0
                },
                {
                    duration: 900 + Math.random() * 600,
                    delay: Math.random() * 400,
                    easing: 'cubic-bezier(0.5, 0, 0.9, 0.6)',
                    fill: 'forwards'
                }
            );
        });

        Promise.all(anims.map((a) => a.finished)).then(() => {
            imgs.forEach((img) => (img.style.display = 'none'));
            document.body.classList.remove('clutter2-pending');
            document.body.classList.add('clutter2-cleared');
        });
    }

    window.addEventListener('load', () => setTimeout(clearClutter, 800));
}
