/* =========================================================
   HEALSPHERE - MAIN FRONTEND SCRIPT
   Major Project - iNeuBytes Internship
   ========================================================= */


/* ---------- Mobile Navigation ---------- */

function initializeMobileNavigation() {

    const menuButton =
        document.querySelector(
            ".mobile-menu-btn"
        );

    const nav =
        document.querySelector(
            ".nav-links"
        );


    if (!menuButton || !nav) {
        return;
    }


    menuButton.addEventListener(
        "click",
        () => {

            nav.classList.toggle(
                "active"
            );

            menuButton.classList.toggle(
                "active"
            );
        }
    );


    const navLinks =
        nav.querySelectorAll(
            "a"
        );


    navLinks.forEach(link => {

        link.addEventListener(
            "click",
            () => {

                nav.classList.remove(
                    "active"
                );

                menuButton.classList.remove(
                    "active"
                );
            }
        );
    });
}


/* ---------- Smooth Scrolling ---------- */

function initializeSmoothScrolling() {

    const links =
        document.querySelectorAll(
            'a[href^="#"]'
        );


    links.forEach(link => {

        link.addEventListener(
            "click",
            event => {

                const targetId =
                    link.getAttribute(
                        "href"
                    );


                if (
                    !targetId ||
                    targetId === "#"
                ) {
                    return;
                }


                const target =
                    document.querySelector(
                        targetId
                    );


                if (!target) {
                    return;
                }


                event.preventDefault();


                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }
        );
    });
}


/* ---------- Contact Form ---------- */

function initializeContactForm() {

    const form =
        document.getElementById(
            "contactForm"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const name =
                form.querySelector(
                    "[name='name']"
                )?.value.trim();


            const email =
                form.querySelector(
                    "[name='email']"
                )?.value.trim();


            const phone =
                form.querySelector(
                    "[name='phone']"
                )?.value.trim();


            const message =
                form.querySelector(
                    "[name='message']"
                )?.value.trim();


            /* ---------- Validation ---------- */

            if (
                !name ||
                !email ||
                !message
            ) {

                HealSphereUtils.showToast(
                    "Please fill in all required fields.",
                    "error"
                );

                return;
            }


            if (
                !HealSphereUtils.isValidEmail(
                    email
                )
            ) {

                HealSphereUtils.showToast(
                    "Please enter a valid email address.",
                    "error"
                );

                return;
            }


            if (
                phone &&
                !HealSphereUtils.isValidPhone(
                    phone
                )
            ) {

                HealSphereUtils.showToast(
                    "Please enter a valid phone number.",
                    "error"
                );

                return;
            }


            const submitButton =
                form.querySelector(
                    "button[type='submit']"
                );


            HealSphereUtils.setButtonLoading(
                submitButton,
                true,
                "Sending..."
            );


            try {

                /*
                 * Contact messages will ultimately
                 * be stored/processed by the backend.
                 */

                await HealSphereAPI.post(
                    "/contact",
                    {
                        name,
                        email,
                        phone,
                        message
                    }
                );


                HealSphereUtils.showToast(
                    "Your message has been sent successfully!",
                    "success"
                );


                form.reset();


            } catch (error) {

                /*
                 * We don't silently pretend the
                 * backend accepted the message.
                 */

                HealSphereUtils.showToast(
                    error.message ||
                    "Unable to send your message right now.",
                    "error"
                );

            } finally {

                HealSphereUtils.setButtonLoading(
                    submitButton,
                    false
                );
            }
        }
    );
}


/* ---------- Scroll Header ---------- */

function initializeHeaderScroll() {

    const header =
        document.querySelector(
            ".site-header"
        );


    if (!header) {
        return;
    }


    const updateHeader =
        () => {

            if (
                window.scrollY > 30
            ) {

                header.classList.add(
                    "scrolled"
                );

            } else {

                header.classList.remove(
                    "scrolled"
                );
            }
        };


    window.addEventListener(
        "scroll",
        updateHeader
    );

    updateHeader();
}


/* ---------- Active Navigation ---------- */

function initializeActiveNavigation() {

    const currentPage =
        window.location.pathname
            .split("/")
            .pop();


    const links =
        document.querySelectorAll(
            "a[href]"
        );


    links.forEach(link => {

        const href =
            link.getAttribute(
                "href"
            );


        if (
            !href ||
            href.startsWith("#") ||
            href.startsWith("http")
        ) {
            return;
        }


        const linkPage =
            href.split("/").pop();


        if (
            linkPage &&
            linkPage === currentPage
        ) {

            link.classList.add(
                "active"
            );
        }
    });
}


/* ---------- Landing Page Buttons ---------- */

function initializeLandingActions() {

    const loginButtons =
        document.querySelectorAll(
            "[data-action='login']"
        );


    loginButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                window.location.href =
                    HealSphereUtils.getProjectPath(
                        "pages/login.html"
                    );
            }
        );
    });


    const registerButtons =
        document.querySelectorAll(
            "[data-action='register']"
        );


    registerButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                window.location.href =
                    HealSphereUtils.getProjectPath(
                        "pages/register.html"
                    );
            }
        );
    });
}


/* ---------- Global Initialization ---------- */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeMobileNavigation();

        initializeSmoothScrolling();

        initializeContactForm();

        initializeHeaderScroll();

        initializeActiveNavigation();

        initializeLandingActions();

    }
);


/* ---------- Global Main Object ---------- */

window.HealSphereMain = {

    initializeMobileNavigation,
    initializeSmoothScrolling,
    initializeContactForm,
    initializeHeaderScroll,
    initializeActiveNavigation,
    initializeLandingActions

};