import getPlantUmlUrl from "./plantuml.js";

async function getElements() {
  const response = await fetch("/api/aspects");
  return response.json();
}

async function getMixes() {
  const response = await fetch("/api/mixes");
  return response.json();
}

async function addElement(data) {
  await fetch("/api/aspects", {
    method: "POST",
    body: data
  });
  renderElements();
}

function getPageElements() {
  return new Proxy({}, {
    get: (_target, prop, _receiver) => {
      return document.getElementById(prop);
    }
  });
}

const { elementForm, elementsShowcase, inputElements, outputElements, imgInput, nameInput, clearButton } = getPageElements();
elementForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const form = e.target;
  addElement(new FormData(form));
  form.reset();
});

async function renderElements() {
  const elements = await getElements();
  elementsShowcase.innerHTML = "";
  elements.forEach(({ name }) => {
    const element = document.createElement("img");
    element.src = `/imgs/${name}`;
    element.dataset.name = name;
    element.title = name;
    element.draggable = true;
    element.addEventListener("dragstart", onDragStart);
    elementsShowcase.appendChild(element);
  });

  updateDiagram();
}

async function updateDiagram() {
  const mixes = await getMixes();
  const umlData = `
  @startuml aspects
  skinparam backgroundColor transparent
  ${mixes.map(({ inputs }) => inputs.map((input) => `card ${input}`).join("\n")).join("\n")}
  ${mixes.map(({ outputs }) => outputs.map((output) => `card ${output}`).join("\n")).join("\n")}
  ${mixes.map(({ inputs }) => `circle x as ${inputs.join("")} #text:transparent`).join("\n")}
  ${mixes.map(({ inputs, color }) => inputs.map((input) => `${input} --> ${inputs.join("")} #${color.slice(1)};text:${color.slice(1)} : ${input}`).join("\n")).join("\n")}
  ${mixes.map(({ inputs, outputs, color }) => outputs.map((output) => `${inputs.join("")} 0--> ${output} #${color.slice(1)};text:${color.slice(1)} : ${output}`).join("\n")).join("\n")}
  @enduml
  `;
  document.getElementById("diagram").src = getPlantUmlUrl(umlData);
}

renderElements();

const mixerHolders = [inputElements, outputElements];
mixerHolders.forEach((el) => el.addEventListener("dragover", onDragOver));

mixerHolders.forEach((el) => el.addEventListener("drop", onDrop));

async function onDrop(e) {
  e.preventDefault();
  const data = e.dataTransfer.getData("text");
  const moveTarget = document.querySelector(`[data-name="${data}"]`);
  const clone = moveTarget.cloneNode(true);
  clone.addEventListener("click", removeTarget);
  e.target.appendChild(clone);

  const inputs = collectInputs();
  const outputs = collectOutputs();
  if (e.target === outputElements) {
    if (inputs.length && outputs.length) {
      pushOutputs();
    }
  } else if (e.target === inputElements) {
    refreshOutputs();
  }
}

async function refreshOutputs() {
  outputElements.innerHTML = "";
  const inputs = collectInputs();
  if (inputs.length) {
    const response = await fetch(`/api/mixes/${inputs.sort().join(",")}`);
    const data = await response.json();
    data.forEach((name) => {
      const copyTarget = document.querySelector(`[data-name="${name}"]`);
      const clone = copyTarget.cloneNode(true);
      clone.addEventListener("click", removeTarget);
      outputElements.appendChild(clone);
    });
  }
}

async function pushOutputs() {
  const inputs = collectInputs();
  const outputs = collectOutputs();
  await fetch("/api/mixes", {
    method: "POST",
    body: JSON.stringify({
      inputs,
      outputs
    }),
    headers: {
      "Content-Type": "application/json"
    }
  });
  updateDiagram();
}

function collectInputs() {
  return [...document.querySelectorAll(`#inputElements [data-name]`)].map(e => e.dataset.name);
}

function collectOutputs() {
  return [...document.querySelectorAll(`#outputElements [data-name]`)].map(e => e.dataset.name);
}

function removeTarget(e) {
  const refresh = e.target.parentNode === inputElements;
  e.target.remove();
  if (refresh) {
    refreshOutputs();
  } else {
    pushOutputs();
  }
}

function onDragOver(e) {
  e.preventDefault();
}

function onDragStart(e) {
  e.dataTransfer.setData("text", e.target.dataset.name);
};

imgInput.addEventListener("change", (e) => {
  const name = e.target.files[0]?.name.split(".").slice(0, -1).join(".");
  if (name && !nameInput.value) {
    nameInput.value = name;
  }
});

clearButton.addEventListener("click", () => {
  inputElements.innerHTML = "";
  outputElements.innerHTML = "";
});