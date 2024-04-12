import getPlantUmlUrl from "./plantuml.js";

async function getAspects() {
  const response = await fetch("/api/aspects");
  return response.json();
}

async function getMixes() {
  const response = await fetch("/api/mixes");
  return response.json();
}

async function addAspect(data) {
  await fetch("/api/aspects", {
    method: "POST",
    body: data
  });
  renderAspects();
}

function getPageElements() {
  return new Proxy({}, {
    get: (_target, prop, _receiver) => {
      return document.getElementById(prop);
    }
  });
}

const { aspectForm, aspectsShowcase, inputAspects, outputAspects, imgInput, nameInput, clearButton } = getPageElements();
aspectForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const form = e.target;
  addAspect(new FormData(form));
  form.reset();
});

async function renderAspects() {
  const aspects = await getAspects();
  aspectsShowcase.innerHTML = "";
  aspects.forEach(({ name }) => {
    const aspect = document.createElement("img");
    aspect.src = `/imgs/${name}`;
    aspect.dataset.name = name;
    aspect.title = name;
    aspect.draggable = true;
    aspect.addEventListener("dragstart", onDragStart);
    aspectsShowcase.appendChild(aspect);
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

renderAspects();

const mixerHolders = [inputAspects, outputAspects];
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
  if (e.target === outputAspects) {
    if (inputs.length && outputs.length) {
      pushOutputs();
    }
  } else if (e.target === inputAspects) {
    refreshOutputs();
  }
}

async function refreshOutputs() {
  outputAspects.innerHTML = "";
  const inputs = collectInputs();
  if (inputs.length) {
    const response = await fetch(`/api/mixes/${inputs.sort().join(",")}`);
    const data = await response.json();
    data.forEach((name) => {
      const copyTarget = document.querySelector(`[data-name="${name}"]`);
      const clone = copyTarget.cloneNode(true);
      clone.addEventListener("click", removeTarget);
      outputAspects.appendChild(clone);
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
  return [...inputAspects.querySelectorAll(`[data-name]`)].map(e => e.dataset.name);
}

function collectOutputs() {
  return [...outputAspects.querySelectorAll(`[data-name]`)].map(e => e.dataset.name);
}

function removeTarget(e) {
  const refresh = e.target.parentNode === inputAspects;
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
  inputAspects.innerHTML = "";
  outputAspects.innerHTML = "";
});