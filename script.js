const events = {
    content: document.querySelector(".content"),
    navBar: document.querySelector(".nav-bar"),
    navBarChildren: [...document.querySelector(".nav-bar").children],
    arrayTableOfContents: [...document.querySelector(".tabel-of-content").children],
    tableOfContent: document.querySelector(".tabel-of-content"),
    aboutAuthor: document.querySelector(".about-author"),
    aboutBook: document.querySelector(".about-book"),
    burgerMenuButton: document.getElementById("burger-menu-button"),
    topLine: document.getElementById("top-line"),
    middleLine: document.getElementById("middle-line"),
    bottomLine: document.getElementById("bottom-line"),
};

const settings = Object.freeze({
    container: document.querySelector(".container"),
    book: [...document.querySelectorAll(".page")].reverse(),
    maxRotation: -200,
    minRotation: 0,
});

let state = Object.freeze({
    counter: 0,

});

/**
 * Return `num` normalized to 0..1 in range min..max.
 * @param {number} num 
 * @param {number} min 
 * @param {number} max 
 * @returns number
 */
function scale(num, min, max) {
    if (num < min) return 0;
    if (num > max) return 1;
    return (num - min) / (max - min);
}
  
/**
 * Return `num` transformed from the normalised 0..1 form back to the min..max form.
 * @param {number} num 
 * @param {number} min 
 * @param {number} max 
 * @returns number
 */
function toAbsolute(num, min, max) {
  if (num < 0) return min;
  if (num > 1) return max;
  return num * (max - min) + min;
}

/**
 * Update the state object with the properties included in `newState`.
 * @param {Object} newState An object with the properties to update in the state object.
 */
function updateState(newState) {
  state = Object.freeze({ ...state, ...newState });
}

/**
 * Sets all the interaction of the user with the pages for the scrolling event
 */
function scrollAnimation(){

    const {container, book, maxRotation, minRotation} = settings;

    //substracts the top of the visible page from the top of the container
    //returns a negative number but is converted into a positive number
    let topScroll = Math.abs(container.getBoundingClientRect().top);

    //stores the aprox dimension of the scroll bar's thumb
    let scrollThumb = (container.offsetHeight/10) / container.offsetHeight * container.offsetHeight;
    
    //the height of one page in a book
    const onePageHeight = (container.offsetHeight - scrollThumb)/(book.length-1);


    //checkes which is the interveal of the scroll (=> which page is the user interacting with)
    if(topScroll > (onePageHeight * state.counter) && topScroll < (onePageHeight * (state.counter + 1))){

        //a number between 0 and 1
        let scrollNormalized = scale(topScroll, (onePageHeight * state.counter), (onePageHeight * (state.counter + 1)));

        //a number between 0 and -160 
        let scrollDeg = toAbsolute(scrollNormalized, minRotation, maxRotation);

        book[state.counter].style.transform = `translate(-12%, -50%) rotate(${scrollDeg}deg)`;

        // align the first page with the others even if the user scrolls too fast
        if(scrollNormalized <= 0.1 && state.counter == 0) book[state.counter].style.transform = `translate(-12%, -50%) rotate(${minRotation}deg)`;
        
    }

    //moves to the next page as user scrolls down
    if(topScroll > (onePageHeight * (state.counter + 1))){
        updateState({counter: state.counter + 1});
    }

    //moves to the previous page as user scrolls up
    if(topScroll < (onePageHeight * state.counter)){
        updateState({counter: state.counter - 1});
    }

    //sets the unused page to a specific position to prevent breaking when the user scrolls too fast
    for(let i = 0; i < state.counter; i++){
        book[i].style.transform = `translate(-12%, -50%) rotate(${maxRotation}deg)`;
        book[i].classList.remove('shadowed');
    }
    for(let i = state.counter + 1; i < book.length; i++){
        book[i].style.transform = `translate(-12%, -50%) rotate(${minRotation}deg)`;
        book[i].classList.add('shadowed');
    }
}

/**
 * Scroll to a specific page in the book
 * @param {event} event 
 */
function ScrollToPage(event){
    const {container, book} = settings;
    //stores the aprox. dimension of the scroll bar's thumb
    let scrollThumb = (container.offsetHeight/10) / container.offsetHeight * container.offsetHeight;
    //the height of one page in a book
    const onePageHeight = (container.offsetHeight - scrollThumb)/(book.length-1);

    //find and store the index of the element that triggered the event
    const index = events.arrayTableOfContents.findIndex((element) => {
        return element === event.target;
    });

    //Scroll to the requested page using the index of the element that triggered the event
    window.scrollTo({
        top: (onePageHeight * index) + 1,
        behavior: 'smooth'
    });

    BurgerMenuToggle();
}

/**
 * Toggles burger menu visibility
 */
function BurgerMenuToggle(){
    if (events.content.style.display === "block") {
        events.content.style.display = "none";
        events.middleLine.style.display = "block";
        events.topLine.style.transform = "rotate(0deg)";
        events.bottomLine.style.transform = "rotate(0deg)";
    } else {
        events.middleLine.style.display = "none";
        events.topLine.style.transform = "translateY(250%) rotate(45deg)";
        events.bottomLine.style.transform = "translateY(-250%) rotate(-45deg)";
        events.content.style.display = "block";
    }
}

/**
 * Updates the button in the navigation menu and displays the right panel
 * @param {event} event 
 */
function NavigationMenu(event){

    if(event.target.id === "table-of-content" || event.target.id === "about-author" || event.target.id === "about-book"){

        events.navBarChildren.forEach( element => {
            element.classList.remove("selected");
            element.classList.add("unselected");
        });
    
        if(event.target.id === "table-of-content"){
            events.tableOfContent.style.display = "block";
            events.aboutAuthor.style.display = "none";
            events.aboutBook.style.display = "none";
        }
        else if(event.target.id === "about-author"){
            events.tableOfContent.style.display = "none";
            events.aboutAuthor.style.display = "block";
            events.aboutBook.style.display = "none";
        }
        else if(event.target.id === "about-book"){
            events.tableOfContent.style.display = "none";
            events.aboutAuthor.style.display = "none";
            events.aboutBook.style.display = "block";
        }
    
        event.target.classList.add("selected");
        event.target.classList.remove("unselected");
    }
}

/**************** EVENT LISTENERS ****************/
window.addEventListener('scroll', scrollAnimation);

events.arrayTableOfContents.forEach( element => {
    element.addEventListener('pointerdown', ScrollToPage);
});

events.burgerMenuButton.addEventListener('pointerdown',BurgerMenuToggle);

events.navBar.addEventListener('pointerdown', NavigationMenu);

window.addEventListener("load", function() {
    window.scrollTo({
        top: 1,
        behavior: 'smooth'
    });
});
