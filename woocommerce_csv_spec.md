# WooCommerce CSV Import Specification

This document explains how to structure **parent** and **variation** CSVs so that WooCommerce will correctly import variable products.

---

## 1) Concepts

- A **parent** (variable) product defines the *sets of options* for each attribute (e.g., Color = Red | Blue; Size = S | M | L).
- Each **variation** picks **one value for each attribute** (e.g., Color = Red, Size = M) and carries its own price/stock/etc.
- Column names must match **exactly**, and variation attribute columns must mirror the **parent’s attribute names**.

---

## 2) Parent CSV (variable products)

### Required base columns
```
post_title, post_name, post_status, sku, stock_status, images, tax:product_type, tax:product_cat
```
- `tax:product_type` must be `variable` for parent rows.
- `sku` is the parent’s SKU and will be referenced by its variations in `parent_sku`.

### Attribute columns
For each attribute `<AttrName>` you want on the parent, add **two** columns:
```
attribute:<AttrName>, attribute_data:<AttrName>
```

#### attribute:<AttrName>
- Pipe-separated list of options as **display text**.
- Example:
  - `attribute:Color = Red | Blue | Green`
  - `attribute:Size = S | M | L`

#### attribute_data:<AttrName>
- Flags controlling how Woo treats this attribute. **Always use 4 flags** in the order:
  ```
  position|visible|is_taxonomy|in_variations
  ```
  - `position`: integer sort order (0 for first attribute, 1 for second, etc.)
  - `visible`: 1 = show on product page; 0 = hide
  - `is_taxonomy`: 1 = use a global attribute taxonomy (e.g., pa_color); 0 = store values as custom attributes
  - `in_variations`: 1 = use this attribute to create variations; 0 = do not

Examples:
- Custom (non-taxonomy) Color: `0|1|0|1`
- Custom Size: `1|1|0|1`

#### Naming rules
- **Custom attributes:** `attribute:Color`, `attribute:Size`
- **Taxonomy attributes:** `attribute:pa_color`, `attribute:pa_size` and set `is_taxonomy=1`. Variations must then use `meta:attribute_pa_color`, etc.

---

## 3) Variation CSV (child rows)

### Required base columns
```
parent_sku, sku, stock_status, regular_price, tax_class, images
```
- `parent_sku` must exactly match the **parent’s `sku`**.
- `tax_class` can be `parent` to inherit or a specific tax class slug.

### Attribute mapping columns
For **each parent attribute `<AttrName>`**, add:
```
meta:attribute_<AttrName>
```

- Each variation row sets this to **exactly one option** from the parent’s `attribute:<AttrName>` values.

Examples:
- `meta:attribute_Color = Yellow`
- `meta:attribute_Size = M`

#### Naming consistency
- If parent used `attribute:Color`, variation must use `meta:attribute_Color`.
- If parent used taxonomy `attribute:pa_color`, variation must use `meta:attribute_pa_color`.

---

## 4) Generation Algorithm

1. Create parent row with `variable` type and base columns.
2. For each attribute:
   - List options in `attribute:<AttrName>` (pipe-separated).
   - Fill `attribute_data:<AttrName>` with `position|visible|is_taxonomy|in_variations`.
3. Write parent row to parent CSV.
4. For each variation (combination of attributes):
   - Add row to variation CSV with `parent_sku` matching parent’s `sku`.
   - Assign attribute values to `meta:attribute_<AttrName>` exactly as in parent.
   - Include price, stock, tax, and images.

---

## 5) Validation Checklist

- Parent type is `variable`.
- Attribute pairs (`attribute:*` and `attribute_data:*`) exist.
- `attribute_data` flags always have 4 fields in the correct order.
- `parent_sku` in variations matches parent’s `sku`.
- Variation `meta:attribute_*` values match parent’s attribute options exactly (trim spaces).
- Attribute column names consistent between parent and variation (including `pa_` prefix if using taxonomy).

---

## 6) Example

### Parent (custom attributes)
```
post_title,post_name,post_status,sku,stock_status,images,tax:product_type,tax:product_cat,attribute:Color,attribute_data:Color,attribute:Size,attribute_data:Size
Variable Tee,variable-tee,publish,TEA-OG,instock,https://site/img.jpg,variable,Tshirts,Red | Blue | Yellow,0|1|0|1,S | M | L,1|1|0|1
```

### Variations
```
parent_sku,sku,stock_status,regular_price,tax_class,images,meta:attribute_Color,meta:attribute_Size
TEA-OG,TEA-OG-RED-S,instock,29.9,parent,https://site/red-s.jpg,Red,S
TEA-OG,TEA-OG-BLUE-M,instock,29.9,parent,https://site/blue-m.jpg,Blue,M
TEA-OG,TEA-OG-YELLOW-L,instock,29.9,parent,https://site/yellow-l.jpg,Yellow,L
```

---

## 7) Common Pitfalls

- Missing `meta:attribute_*` columns in variations.
- Attribute names differ between parent and variations.
- Variation values don’t match parent’s options exactly (case/whitespace).
- Incorrect number/order of `attribute_data` flags.
