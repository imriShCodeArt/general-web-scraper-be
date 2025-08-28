# Recipe Templates and Examples

## Generic E-commerce

```yaml
name: generic-ecommerce
version: 1
selectors:
  product: ".product"
  title: ".product-title"
  price: ".price"
  url: "a@href"
options:
  pagination:
    nextSelector: ".pagination-next"
    maxPages: 5
```

## Hebrew E-commerce (example)

```yaml
name: hebrew-ecommerce
version: 1
selectors:
  product: ".מוצר"
  title: ".כותרת"
  price: ".מחיר"
  url: "a@href"
normalization:
  title:
    - trim
    - removeHebrewChars: false
```

## Tips
- Keep selectors stable and specific.
- Use `normalization` to clean values.
- Validate with `POST /api/recipes/validate`.

