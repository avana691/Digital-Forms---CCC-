
document.addEventListener("DOMContentLoaded", () => {

    // ========================================
    // IMAGE SCATTERING
    // ========================================

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

    // Track cursor across the viewport
    window.addEventListener("mousemove", (event) => {
        mouseX = event.clientX;
        mouseY = event.clientY;
    });

    // Reset when cursor leaves the window
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
            const dx = item.originX - mouseX;
            const dy = item.originY - mouseY;
            const distance = Math.hypot(dx, dy);

            if (distance < radius && distance > 0) {
                const force = (1 - distance / radius) ** 2;

                item.targetX =
                    (dx / distance) * maxDistance * force;

                item.targetY =
                    (dy / distance) * maxDistance * force;
            } else {
                item.targetX = 0;
                item.targetY = 0;
            }

            // Smoothly approach target position
            item.x += (item.targetX - item.x) * smoothing;
            item.y += (item.targetY - item.y) * smoothing;

            // Stop tiny movements
            if (Math.abs(item.targetX - item.x) < 0.05) {
                item.x = item.targetX;
            }

            if (Math.abs(item.targetY - item.y) < 0.05) {
                item.y = item.targetY;
            }

            item.img.style.setProperty(
                "--scatter-x",
                `${item.x}px`
            );

            item.img.style.setProperty(
                "--scatter-y",
                `${item.y}px`
            );
        });

        requestAnimationFrame(animate);
    }

    animate();

});
