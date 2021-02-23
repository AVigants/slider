//todo: add sharp gestures to be recognized as a valid swipe
//todo: clean up code
//todo: better styles

const slider = document.querySelector('.slider');
const prev = document.querySelector('.prev');
const next = document.querySelector('.next');
const carousel = document.querySelector('.carousel');
const indicatorParents = document.querySelector('.controls ul')

let direction = 'forward';
let currentPanel = 0;

let lastPanel = 3;

let skipMoreThanOnePanel = null;

let isMouseMoving = false;
let isMouseDown = false;
let mouseStartPos = 0;
let transform = 0;
let transformVal = 0;
let lastPageX = 0;
let fullSwipe = null;
let deltaX = 0;
let transitionEndBlock = false;
let ignore = false;

const gestureStart = (e) => {
    isMouseDown = true;
    mouseStartPos = e.pageX;
    transform = window.getComputedStyle(slider).getPropertyValue('transform');
    if (transform !== 'none') {
        transform = transform.split(',')[4].trim();
    } else {
        transform = 0;
    }
}
const gestureMove = (e) => {
    if (!isMouseDown) {
        return
    }
    if (isMouseDown) {
        deltaX = e.pageX - mouseStartPos;

        if (deltaX > document.querySelector('section').offsetWidth / 2) {
            fullSwipe = 'prev';
        } else if (deltaX < document.querySelector('section').offsetWidth / -2) {
            fullSwipe = 'next';
        } else {
            fullSwipe = null;
        }

        if (Math.sign(deltaX) === -1) {
            loadContentFront();
        } else if (Math.sign(deltaX) === 1) {
            loadContentBack();
        }

        transformVal = Number(transform) + deltaX;
        slider.style.transition = `none`;
        slider.style.transform = `translateX(${transformVal}px)`;
        setTimeout(() => {
            slider.style.transition = `all 0.3s`;
        });
    }
    lastPageX = e.pageX
}
const gestureEnd = (e) => {
    isMouseDown = false;
    if(!fullSwipe){
        ignore = true;
        slider.style.transform = `translateX(0px)`;
    } else {
        if(fullSwipe==='next'){
            slider.style.transition = `0.3s`
            slider.style.transform = `translate(-${25}%)`;
        } else if(fullSwipe === 'prev'){
            slider.style.transition = `0.3s`
            slider.style.transform = `translate(${25}%)`;
        }
    }
}


const append = (numOfpanelsToAdd = 1) => {
    for (let i = 0; i < numOfpanelsToAdd; i++) {
        slider.appendChild(slider.firstElementChild);
    }
}

const prepend = (numOfpanelsToAdd = 1) => {
    for (let i = 0; i < numOfpanelsToAdd; i++) {
        slider.prepend(slider.lastElementChild)
    }
}

const loadContentFront = () => {
    if (direction === 'backward') {
        direction = 'forward'
        prepend()
        carousel.style.justifyContent = `flex-start`;
    }
}

const loadContentBack = () => {
    if (direction === 'forward') {
        append()
        direction = 'backward';
        carousel.style.justifyContent = `flex-end`
    }
}

// select slide X event
document.querySelectorAll('.controls li').forEach((indicator, ind) => {
    indicator.addEventListener('click', e => {
        if (ind !== currentPanel) {
            let deltaPanels = (currentPanel - ind);
            if (Math.sign(deltaPanels) === -1) { //next
                loadContentFront()
                slider.style.transform = `translate(${25 * deltaPanels}%)`;
            } else if (Math.sign(deltaPanels) === 1) { //prev
                loadContentBack()
                slider.style.transform = `translate(${25 * deltaPanels}%)`;

            }
            if (deltaPanels > 1 || deltaPanels < -1) {
                skipMoreThanOnePanel = deltaPanels;
            }
        }
    })
})

//touch/pointer events
if (window.PointerEvent) {
    slider.addEventListener('pointerdown', gestureStart);
    slider.addEventListener('pointermove', gestureMove);
    slider.addEventListener('pointerup', gestureEnd)
} else if (window.TouchEvent) {
    slider.addEventListener('touchdown', gestureStart);
    slider.addEventListener('touchmove', gestureMove);
    slider.addEventListener('touchup', gestureEnd)
}
//arrow click events
prev.addEventListener('click', e => {
    loadContentBack();
    slider.style.transform = `translate(${25}%)`;
})

next.addEventListener('click', e => {
    loadContentFront();
    slider.style.transform = `translate(-${25}%)`;
})


slider.addEventListener('transitionend', e => {
    if (ignore) {
        ignore = false;
        return
    }
    transitionEndBlock = true;
    //this block will fire if we do a quick, sharp swipe 
    if (skipMoreThanOnePanel) {
        if (Math.sign(skipMoreThanOnePanel) === -1) {//forward
            append(skipMoreThanOnePanel * -1);
            currentPanel = currentPanel - skipMoreThanOnePanel;
        } else if (Math.sign(skipMoreThanOnePanel) === 1) {//backward
            prepend(skipMoreThanOnePanel);
            currentPanel = currentPanel - skipMoreThanOnePanel;
        }
    } else {
        if (direction === 'forward') {
            append();
            if (currentPanel === lastPanel) {
                currentPanel = 0;
            } else {
                currentPanel++;
            }
        } else if (direction === 'backward') {
            prepend();
            if (currentPanel === 0) {
                currentPanel = lastPanel;
            } else {
                currentPanel--;
            }
        }
    }

    slider.style.transition = `none`;
    slider.style.transform = `translate(0)`;
    setTimeout(() => {
        slider.style.transition = `all 0.3s`;
    });

    document.querySelector('.controls .selected').classList.remove('selected');
    indicatorParents.children[currentPanel].classList.add('selected');

    if (skipMoreThanOnePanel) {
        skipMoreThanOnePanel = null;
    }
    if (fullSwipe) {
        fullSwipe = null;
    }
    transitionEndBlock = false;

})