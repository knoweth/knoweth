// Must grab CSRF token to get past Rails's integrity protection (which is
// probably good to keep enabled!)
const csrfToken = document
  .querySelector("meta[name=csrf-token]")
  .getAttribute("content");

export default csrfToken;
