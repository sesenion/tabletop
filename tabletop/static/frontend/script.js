var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const dragged = {
    element: null,
    internalCursorX: 0,
    internalCursorY: 0,
};
const backendUrl = "http://localhost:8000";
function initialize() {
    const sprites = Array(document.querySelectorAll(".sprite"));
    sprites.forEach(() => addEventListener("dragstart", dragstartHandler));
    const dropElements = document.querySelectorAll("#playing-field");
    dropElements.forEach(() => addEventListener("drop", dropHandler));
    dropElements.forEach(() => addEventListener("dragenter", (event) => event.preventDefault()));
    dropElements.forEach((dropElement) => dropElement.addEventListener("dragover", (event) => event.preventDefault()));
}
function readSpriteData(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const spriteUrl = `${backendUrl}/sprites/`;
        const response = yield fetch(spriteUrl, {
            method: "GET",
            mode: "same-origin",
            cache: "no-cache",
            credentials: "same-origin",
            redirect: "follow",
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        });
        const data = yield response.json();
        for (const sprite of data) {
            setOrCreateSprite(sprite.id, sprite.name, sprite.x_pos, sprite.y_pos);
        }
    });
}
function createSprite(id, name, xPos, yPos) {
    const playing_field = document.querySelector("#playing-field");
    const sprite = document.createElement("div");
    sprite.id = `sprite-${id}`;
    sprite.className = "sprite";
    if (name !== null)
        sprite.textContent = name;
    sprite.draggable = true;
    sprite.style.backgroundColor = "#ffffff";
    sprite.addEventListener("dragstart", dragstartHandler);
    //sprite.addEventListener("dragend", dragendHandler);
    playing_field.appendChild(sprite);
    return sprite;
}
function setOrCreateSprite(id, name = null, xPos, yPos) {
    const playing_field = document.querySelector("#playing-field");
    let sprite = playing_field.querySelector(`#sprite-${id}`);
    if (sprite === null) {
        sprite = createSprite(id, name, xPos, yPos);
    }
    sprite.textContent = name;
    sprite.style.left = `${xPos}px`;
    sprite.style.top = `${yPos}px`;
    return sprite;
}
/**
 * determines new top left position of a dropped sprite
 * on the playing field.
 *
 * @date 9/6/2023 - 7:29:29 AM
 *
 * @param {DraggedElement} dragged
 * @param {Event} event
 * @returns {[number, number]}
 */
function determineNewPosition(dragged, event) {
    if (dragged.element === null) {
        return [0, 0];
    }
    // get mouse cursor position inside the drop target element.
    // Assume drop target is #playing-field and correct later if that
    // assumption is false.
    let dropXRelativeToPlayingField = event.layerX;
    let dropYRelativeToPlayingField = event.layerY;
    if (event.target.classList.contains("sprite")) {
        // drop happened on another sprite instead of the playing field,
        // but we need it relative to the playing field. So add offset of
        // the drop target sprite, since that is relative to the playing
        // field.
        dropXRelativeToPlayingField += event.target.offsetLeft;
        dropYRelativeToPlayingField += event.target.offsetTop;
    }
    // top left position of the dragged sprite needs to be corrected
    // for where inside the sprite the drag cursor was when drag started
    let newX = dropXRelativeToPlayingField - dragged.internalCursorX;
    let newY = dropYRelativeToPlayingField - dragged.internalCursorY;
    return [newX, newY];
}
function dropHandler(event) {
    console.log(dragged.element);
    console.log(event);
    if (dragged.element === null)
        return;
    const [newX, newY] = determineNewPosition(dragged, event);
    dragged.element.style.left = `${newX}px`;
    dragged.element.style.top = `${newY}px`;
    dragged.element = null;
    readSpriteData(1);
}
function dragstartHandler(event) {
    console.log(event);
    dragged.element = event.target;
    dragged.internalCursorX = event.layerX;
    dragged.internalCursorY = event.layerY;
}
function dragendHandler(event) {
    console.log(event);
}
initialize();
