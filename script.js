const canvas = document.getElementById('wheel');
const spinButton = document.getElementById('spin-btn');
const nameInput = document.getElementById('name-input');
const addNameButton = document.getElementById('add-name-btn');
const userNamesList = document.getElementById('user-names-list');
const spinSound = document.getElementById('spin-sound');

const ctx = canvas.getContext('2d');
const size = canvas.width;
const radius = size / 2;

// Default constant names
const defaultNames = ['Alice', 'Bob', 'Charlie', 'David', 'Eve'];
let userNames = [];
let activeUserNames = [];
let segments = [];
let spinning = false;
let startAngle = 0;
let spinSpeed = 0.1;  // Set initial spin speed for longer spin
let targetAngle = 0;  // The angle where we want the wheel to stop
let maxSpinTime = 5000; // Maximum spin time in milliseconds (5 seconds)

const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
};

const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

// Draw the wheel with shuffled names and unique colors
const drawWheel = () => {
    const numSegments = segments.length;
    const angleStep = (2 * Math.PI) / numSegments;

    ctx.clearRect(0, 0, size, size);

    // Draw each segment with a unique color
    segments.forEach((name, index) => {
        const angle = startAngle + index * angleStep;

        // Assign a random color to each segment
        const segmentColor = getRandomColor();

        // Draw segment with unique color
        ctx.beginPath();
        ctx.moveTo(radius, radius);
        ctx.arc(radius, radius, radius, angle, angle + angleStep);
        ctx.fillStyle = segmentColor;
        ctx.fill();

        // Add text
        ctx.save();
        ctx.translate(radius, radius);
        ctx.rotate(angle + angleStep / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#fff';
        ctx.font = '18px Arial';
        ctx.fillText(name, radius - 10, 10);
        ctx.restore();
    });
};

// Spin the wheel
const spinWheel = () => {
    if (spinning) return;
    if (segments.length === 0) {
        alert('No names left to spin!');
        return;
    }
    spinning = true;

    spinSound.play();
    spinSpeed = 0.1;  // This will make the spin longer
    const startTime = Date.now();

    // Set the target angle based on where the wheel starts
    targetAngle = startAngle;

    const animate = () => {
        const elapsedTime = Date.now() - startTime;
        const timeFraction = Math.min(elapsedTime / maxSpinTime, 1); // Normalize the time (0 to 1)

        // Slow down the spin gradually
        spinSpeed *= 0.995; // Slows down gradually

        startAngle += spinSpeed;

        if (timeFraction < 1) {
            drawWheel();
            requestAnimationFrame(animate);
        } else {
            spinning = false;

            // Determine the chosen segment
            const angleStep = (2 * Math.PI) / segments.length;
            const normalizedAngle = (startAngle % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI); // Normalize the angle
            const chosenIndex = Math.floor((segments.length - normalizedAngle / angleStep) % segments.length);
            const chosenName = segments[chosenIndex];

            // Stop the sound and show alert
            spinSound.pause();
            spinSound.currentTime = 0; // Reset the sound to the beginning

            // Show alert when the wheel stops
            if (confirm(`The wheel stopped on: ${chosenName}. Click OK to continue.`)) {
                // Remove the chosen name if it's a user input
                const userIndex = userNames.indexOf(chosenName);
                if (userIndex !== -1) {
                    userNames.splice(userIndex, 1); // Remove from userNames
                    activeUserNames.splice(activeUserNames.indexOf(chosenName), 1); // Also remove from active
                }

                // Update the wheel
                segments = [...defaultNames, ...activeUserNames];
                shuffle(segments); // Shuffle the combined array of names
                drawWheel();
            }
        }
    };

    animate();
};

const updateUserNamesList = () => {
    userNamesList.innerHTML = '';
    userNames.forEach((name) => {
        const listItem = document.createElement('li');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = true;
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                if (!activeUserNames.includes(name)) activeUserNames.push(name);
            } else {
                const index = activeUserNames.indexOf(name);
                if (index !== -1) activeUserNames.splice(index, 1);
            }
            segments = [...defaultNames, ...activeUserNames];
            shuffle(segments); // Shuffle the combined names each time the list changes
            drawWheel();
        });

        listItem.appendChild(checkbox);
        listItem.appendChild(document.createTextNode(name));
        userNamesList.appendChild(listItem);
    });
};

addNameButton.addEventListener('click', () => {
    const name = nameInput.value.trim();
    if (name) {
        userNames.push(name);
        activeUserNames.push(name);
        segments = [...defaultNames, ...activeUserNames];
        shuffle(segments); // Shuffle the combined names after adding a new user
        updateUserNamesList();
        drawWheel();
        nameInput.value = '';
    }
});

// Initial draw
segments = [...defaultNames];
shuffle(segments); // Shuffle the default names initially
drawWheel();

spinButton.addEventListener('click', spinWheel);
