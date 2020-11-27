// Must grab CSRF token to get past Rails's integrity protection (which is
// probably good to keep enabled!)
const csrfTag = document.querySelector("meta[name=csrf-token]");

const csrfToken = csrfTag !== null ? csrfTag.getAttribute("content") : "";

export default csrfToken;
