console.log("JS FILE LOADED");


document.addEventListener("DOMContentLoaded", function () {

    console.log("DOM LOADED");


    // =========================
    // SMOOTH SCROLLING
    // =========================

    function smoothScrollTo(targetSection) {

        if (!targetSection) {
            return;
        }


        const startPosition = window.scrollY;

        const targetPosition =
            targetSection.getBoundingClientRect().top +
            window.scrollY;

        const distance =
            targetPosition - startPosition;


        const duration = 800;

        let startTime = null;


        function smoothScroll(currentTime) {

            if (startTime === null) {
                startTime = currentTime;
            }


            const elapsed =
                currentTime - startTime;


            const progress =
                Math.min(elapsed / duration, 1);


            // Ease-out animation

            const ease =
                progress * (2 - progress);


            window.scrollTo(
                0,
                startPosition + distance * ease
            );


            if (progress < 1) {

                requestAnimationFrame(
                    smoothScroll
                );

            }

        }


        requestAnimationFrame(
            smoothScroll
        );

    }


    // =========================
    // INTERNAL LINKS
    // =========================

    const internalLinks =
        document.querySelectorAll('a[href^="#"]');


    internalLinks.forEach(function (link) {

        link.addEventListener(
            "click",
            function (event) {

                const targetId =
                    link.getAttribute("href");


                // Ignore empty "#"

                if (
                    !targetId ||
                    targetId === "#"
                ) {
                    return;
                }


                const targetSection =
                    document.querySelector(targetId);


                if (!targetSection) {
                    return;
                }


                event.preventDefault();


                smoothScrollTo(
                    targetSection
                );


                // Close mobile menu

                if (
                    window.innerWidth <= 768 &&
                    navMenu
                ) {

                    navMenu.style.display =
                        "none";

                }

            }
        );

    });


    // =========================
    // MOBILE MENU
    // =========================

    const menuToggle =
        document.querySelector(
            ".menu-toggle"
        );


    const navMenu =
        document.querySelector(
            "nav ul"
        );


    if (menuToggle && navMenu) {

        menuToggle.addEventListener(
            "click",
            function () {

                if (
                    navMenu.style.display ===
                    "flex"
                ) {

                    navMenu.style.display =
                        "none";

                } else {

                    navMenu.style.display =
                        "flex";

                }

            }
        );

    }


    // =========================
    // APPOINTMENT BUTTONS
    // =========================

    const appointmentButtons =
        document.querySelectorAll(
            ".appointment-btn, .nav-appointment"
        );


    appointmentButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const appointmentSection =
                        document.querySelector(
                            "#appointment"
                        );


                    smoothScrollTo(
                        appointmentSection
                    );

                }
            );

        }
    );


    // =========================
    // CONTACT FORM VALIDATION
    // =========================

    const contactForm =
        document.querySelector(
            "#contactForm"
        );


    if (contactForm) {

        contactForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                const name =
                    contactForm
                        .querySelector(
                            'input[type="text"]'
                        )
                        .value
                        .trim();


                const phone =
                    contactForm
                        .querySelector(
                            'input[type="tel"]'
                        )
                        .value
                        .trim();


                const email =
                    contactForm
                        .querySelector(
                            'input[type="email"]'
                        )
                        .value
                        .trim();


                const message =
                    contactForm
                        .querySelector(
                            "textarea"
                        )
                        .value
                        .trim();


                // Check name

                if (name.length < 3) {

                    alert(
                        "Please enter a valid name."
                    );

                    return;

                }


                // Check phone number

                if (
                    !/^[0-9]{10}$/.test(phone)
                ) {

                    alert(
                        "Please enter a valid 10-digit phone number."
                    );

                    return;

                }


                // Check email

                if (
                    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/
                        .test(email)
                ) {

                    alert(
                        "Please enter a valid email address."
                    );

                    return;

                }


                // Check message

                if (message.length < 10) {

                    alert(
                        "Please enter a message of at least 10 characters."
                    );

                    return;

                }


                alert(
                    "Your message has been submitted successfully!"
                );


                contactForm.reset();

            }
        );

    }


    // =========================
    // APPOINTMENT FORM VALIDATION
    // =========================

    const appointmentForm =
        document.querySelector(
            "#appointmentForm"
        );


    if (appointmentForm) {

        appointmentForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                const name =
                    appointmentForm
                        .querySelector(
                            'input[name="patientName"]'
                        )
                        .value
                        .trim();


                const email =
                    appointmentForm
                        .querySelector(
                            'input[name="email"]'
                        )
                        .value
                        .trim();


                const phone =
                    appointmentForm
                        .querySelector(
                            'input[name="phone"]'
                        )
                        .value
                        .trim();


                const department =
                    appointmentForm
                        .querySelector(
                            'select[name="department"]'
                        )
                        .value;


                const message =
                    appointmentForm
                        .querySelector(
                            'textarea[name="message"]'
                        )
                        .value
                        .trim();


                // Check patient name

                if (name.length < 3) {

                    alert(
                        "Please enter a valid patient name."
                    );

                    return;

                }


                // Check phone number

                if (
                    !/^[0-9]{10}$/.test(phone)
                ) {

                    alert(
                        "Please enter a valid 10-digit phone number."
                    );

                    return;

                }


                // Check email

                if (
                    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/
                        .test(email)
                ) {

                    alert(
                        "Please enter a valid email address."
                    );

                    return;

                }


                // Check department

                if (department === "") {

                    alert(
                        "Please select a department."
                    );

                    return;

                }


                // Check message

                if (message.length < 10) {

                    alert(
                        "Please enter a message of at least 10 characters."
                    );

                    return;

                }


                alert(
                    "Your appointment request has been submitted successfully!"
                );


                appointmentForm.reset();

            }
        );

    }


    // =========================
    // TESTIMONIAL PAGINATION
    // =========================

    const testimonialCards =
        document.querySelectorAll(
            ".testimonial-card"
        );


    const reviewsButton =
        document.querySelector(
            "#reviewsBtn"
        );


    // Keeps track of which set is visible
    // 0 = first three
    // 1 = next three

    let currentReviewSet = 0;


    // Function to display exactly three reviews

    function showReviews(startIndex) {

        testimonialCards.forEach(
            function (card) {

                card.classList.remove(
                    "active-review"
                );

            }
        );


        for (
            let i = startIndex;
            i < startIndex + 3;
            i++
        ) {

            if (testimonialCards[i]) {

                testimonialCards[i].classList.add(
                    "active-review"
                );

            }

        }

    }


    // Show the first three reviews
    // when the page loads

    showReviews(0);


    // Change to the next/previous three

    if (reviewsButton) {

        reviewsButton.addEventListener(
            "click",
            function () {

                if (currentReviewSet === 0) {

                    // Replace first 3
                    // with next 3

                    currentReviewSet = 1;

                    showReviews(3);

                    reviewsButton.textContent =
                        "View Previous Reviews";

                } else {

                    // Replace next 3
                    // with first 3

                    currentReviewSet = 0;

                    showReviews(0);

                    reviewsButton.textContent =
                        "View More Reviews";

                }

            }
        );

    }

});