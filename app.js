const languageSelect = document.querySelector("#language");
const titleElement = document.querySelector("#policy-title");
const updatedLabelElement = document.querySelector("#updated-label");
const updatedDateElement = document.querySelector("#updated-date");
const contentElement = document.querySelector("#policy-content");
const contactLabelElement = document.querySelector("#contact-label");

function detectLanguage(policies) {
  const current = navigator.language.toLowerCase();
  if (current.startsWith("zh-tw") || current.startsWith("zh-hk") || current.startsWith("zh-mo")) return "zh-Hant";
  if (current.startsWith("zh")) return "zh";
  const short = current.split("-")[0];
  return Object.hasOwn(policies, short) ? short : "en";
}

function renderPolicy(locale, policies, billingPolicies) {
  const policy = policies[locale];
  const billingPolicy = billingPolicies[locale];
  const paragraphs = [
    billingPolicy.updated,
    ...policy.body.split("\n\n").slice(1),
    billingPolicy.billing,
  ];
  document.documentElement.lang = locale;
  document.title = `VideoVault | ${policy.title}`;
  titleElement.textContent = policy.title;
  updatedLabelElement.textContent = policy.updatedLabel;
  updatedDateElement.textContent = paragraphs[0];
  contactLabelElement.textContent = policy.contactLabel;
  contentElement.replaceChildren();

  paragraphs.slice(1).forEach((section, index) => {
    const separator = section.indexOf("\n");
    const heading = section.slice(0, separator);
    const text = section.slice(separator + 1);
    const sectionElement = document.createElement("section");
    sectionElement.className = "policy-section";
    const numberElement = document.createElement("div");
    numberElement.className = "section-number";
    numberElement.setAttribute("aria-hidden", "true");
    numberElement.textContent = String(index + 1).padStart(2, "0");
    const bodyElement = document.createElement("div");
    const headingElement = document.createElement("h2");
    const paragraphElement = document.createElement("p");
    headingElement.textContent = heading;
    paragraphElement.textContent = text;
    bodyElement.append(headingElement, paragraphElement);
    sectionElement.append(numberElement, bodyElement);
    contentElement.append(sectionElement);
  });
}

Promise.all([
  fetch("./policies.json"),
  fetch("./billing-policies.json"),
])
  .then(async ([policiesResponse, billingResponse]) => {
    if (!policiesResponse.ok) throw new Error(`Unable to load policies: ${policiesResponse.status}`);
    if (!billingResponse.ok) throw new Error(`Unable to load billing policy: ${billingResponse.status}`);
    return [await policiesResponse.json(), await billingResponse.json()];
  })
  .then(([policies, billingPolicies]) => {
    Object.entries(policies).forEach(([key, policy]) => {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = policy.language;
      languageSelect.append(option);
    });
    const initialLanguage = detectLanguage(policies);
    languageSelect.value = initialLanguage;
    renderPolicy(initialLanguage, policies, billingPolicies);
    languageSelect.addEventListener("change", () => renderPolicy(languageSelect.value, policies, billingPolicies));
  })
  .catch(() => {
    const section = document.createElement("section");
    section.className = "policy-section";
    const number = document.createElement("div");
    number.className = "section-number";
    number.textContent = "!";
    const body = document.createElement("div");
    const heading = document.createElement("h2");
    heading.textContent = "No se pudo cargar la política";
    const text = document.createElement("p");
    text.textContent = "Escribe a videovault.support@gmail.com para recibir ayuda.";
    body.append(heading, text);
    section.append(number, body);
    contentElement.replaceChildren(section);
  });