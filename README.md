Bootstrap 4 Shortcodes for WordPress
===

![WordPress Rating](https://img.shields.io/wordpress/plugin/r/bootstrap-4-shortcodes.svg) ![WordPress Downloads](https://img.shields.io/wordpress/plugin/dt/bootstrap-4-shortcodes.svg)

WordPress plugin that provides shortcodes for easier use of the Bootstrap 4 styles and components in your content.

**Bootstrap 4 Shortcodes for WordPress** creates a simple, out of the way button just above the WordPress TinyMCE editor (next to the "Add Media" button) which pops up the plugin's documentation and shortcode examples for reference and handy "Insert Example" links to send the example shortcodes straight to the editor. There are no additional TinyMCE buttons to clutter up your screen, just great, easy to use shortcodes!

## Requirements
![Tested in WordPress](https://img.shields.io/wordpress/v/bootstrap-4-shortcodes.svg) ![PHP 5.3+](https://img.shields.io/badge/PHP-5.3%2B-blue.svg) ![Bootstrap](https://img.shields.io/badge/Bootstrap-4-6f5499.svg)

This plugin won't do anything if you don't have WordPress theme built with the [Bootstrap 4](http://getbootstrap.com/) framework. **This plugin does not include the Bootstrap framework**.

The plugin is tested to work with ```Bootstrap 4``` and ```WordPress 4.6``` and **requires PHP 5.3 or later**.

## Shortcode Reference

### Layout
* [Grid](#grid)
* [Media Object](#media-object)
* [Responsive Utilities](#responsive-utilities)

# Usage and Examples

### Layout

### Grid
    [row]
      [column sm="6"]
        ...
      [/column]
      [column sm="6"]
        ...
      [/column]
    [/row]

Flexbox columns are supported by using "flex" rather than a column width.

    [row]
      [column xs="flex"]
        ...
      [/column]
      [column xs="flex"]
        ...
      [/column]
    [/row]

The container component is also supported in case your theme doesn't include a container.

    [container]
      [row]
        [column sm="6"]
          ...
        [/column]
        [column sm="6"]
          ...
        [/column]
      [/row]
    [/container]

The container-fluid component is supported as a discrete shortcode.

    [container-fluid]
      [row]
        [column sm="6"]
          ...
        [/column]
        [column sm="6"]
          ...
        [/column]
      [/row]
    [/container-fluid]

#### [container] parameters
Parameter | Description | Required | Values | Default
--- | --- | --- | --- | ---
class | Any extra classes you want to add | optional | any text | none
data | Data attribute and value pairs separated by a comma. Pairs separated by pipe. | optional | any text | none

#### [container-fluid] parameters
Parameter | Description | Required | Values | Default
--- | --- | --- | --- | ---
class | Any extra classes you want to add | optional | any text | none
data | Data attribute and value pairs separated by a comma. Pairs separated by pipe. | optional | any text | none

#### [row] parameters
Parameter | Description | Required | Values | Default
--- | --- | --- | --- | ---
class | Any extra classes you want to add | optional | any text | none
data | Data attribute and value pairs separated by a comma. Pairs separated by pipe. | optional | any text | none

#### [column] parameters
Parameter | Description | Required | Values | Default
--- | --- | --- | --- | ---
xs | Size of column on extra small screens (less than 768px) | optional | 1-12, flex | none
sm | Size of column on small screens (greater than 768px) | optional | 1-12, flex | none
md | Size of column on medium screens (greater than 992px) | optional | 1-12, flex | none
lg | Size of column on large screens (greater than 1200px) | optional | 1-12, flex | none
xl | Size of column on extra large screens (greater than 1200px) | optional | 1-12, flex | none
offset_xs | Offset on extra small screens | optional | 1-12 | none
offset_sm | Offset on small screens | optional | 1-12 | none
offset_md | Offset on column on medium screens | optional | 1-12 | none
offset_lg | Offset on column on large screens | optional | 1-12 | none
offset_xl | Offset on column on extra large screens | optional | 1-12 | none
pull_xs | Pull on extra small screens | optional | 1-12 | none
pull_sm | Pull on small screens | optional | 1-12 | none
pull_md | Pull on column on medium screens | optional | 1-12 | none
pull_lg | Pull on column on large screens | optional | 1-12 | none
pull_xl | Pull on column on extra large screens | optional | 1-12 | none
push_xs | Push on extra small screens | optional | 1-12 | none
push_sm | Push on small screens | optional | 1-12 | none
push_md | Push on column on medium screens | optional | 1-12 | none
push_lg | Push on column on large screens | optional | 1-12 | none
push_xl | Push on column on extra large screens | optional | 1-12 | none
class | Any extra classes you want to add | optional | any text | none
data | Data attribute and value pairs separated by a comma. Pairs separated by pipe. | optional | any text | none

[Bootstrap 4 grid documentation](http://getbootstrap.com/layout/grid/).

* * *

### Media Object
    [media]
      [media-object]
        ...
      [/media-object]
      [media-body]
        [media-heading] ... [/media-heading]
        ...
      [/media-body]
    [/media]

### Media List
Wrap several `[media-object]`s in `[media-list]`, useful for comment threads or articles lists.

    [media-list]
      [media]
        [media-object]

          --IMAGE--

        [/media-object]
        [media-body]
          [media-heading]

            --HEADING--

          [/media-heading]
          ...
        [/media-body]
      [/media]
			[media]
        [media-object]
          ...
        [/media-object]
        [media-body]
          [media-heading]

            --HEADING--

          [/media-heading]
          ...
        [/media-body]
      [/media]
    [/media-list]

#### [media] parameters
Parameter | Description | Required | Values | Default
--- | --- | --- | --- | ---
class | Any extra classes you want to add | optional | any text | none
data | Data attribute and value pairs separated by a comma. Pairs separated by pipe. | optional | any text | none

#### [media-object] parameters
__NOTE: `[media-object]` should contain an image, or linked image, inserted using the WordPress TinyMCE editor__

Parameter | Description | Required | Values | Default
--- | --- | --- | --- | ---
media | Whether the image pulls to the left or right | optional | left, right | left
alignment | Vertical alignment of the image | optional | middle, bottom | top
class | Any extra classes you want to add | optional | any text | none
data | Data attribute and value pairs separated by a comma. Pairs separated by pipe. | optional | any text | none

#### [media-body] parameters
Parameter | Description | Required | Values | Default
--- | --- | --- | --- | ---
class | Any extra classes you want to add | optional | any text | none
data | Data attribute and value pairs separated by a comma. Pairs separated by pipe. | optional | any text | none

#### [media-heading] parameters
__NOTE: `[media-heading]` should contain heading tag (`h1`, `h2`, `h3`, `h4`, `h5`, or `h6`), inserted using the WordPress editor. If a header tag is not added `h4` will be inserted automatically__

Parameter | Description | Required | Values | Default
--- | --- | --- | --- | ---
class | Any extra classes you want to add | optional | any text | none
data | Data attribute and value pairs separated by a comma. Pairs separated by pipe. | optional | any text | none

#### [media-list] parameters
Parameter | Description | Required | Values | Default
--- | --- | --- | --- | ---
class | Any extra classes you want to add | optional | any text | none
data | Data attribute and value pairs separated by a comma. Pairs separated by pipe. | optional | any text | none

[Bootstrap media object documentation](http://getbootstrap.com/layout/media-object/)

* * *

### Responsive Utilities
	[hidden down="sm"] ... [/hidden]

#### [hidden] parameters
Parameter | Description | Required | Values | Default
--- | --- | --- | --- | ---
up | Hide the contents on this screen size and above | optional | xs, sm, md, lg, xl | none
down | Hide the contents on this screen size and below | optional | xs, sm, md, lg, xl | none
class | Any extra classes you want to add | optional | any text | none
data | Data attribute and value pairs separated by a comma. Pairs separated by pipe. | optional | any text | none

[Bootstrap media objects documentation](http://getbootstrap.com/layout/responsive-utilities/)

* * *

## Components


### Buttons
Wrap any `a`, `button`, or `input` tag inserted via the WordPress editor in `[button]` to give it button properties and classes.

	[button type="primary"] --LINK-- [/button]

Set button sizes with the `size` parameter

	[button type="primary" size="lg"] --LINK-- [/button]

Set `block` flag  for block-style buttons

	[button type="primary" block] --LINK-- [/button]


#### [button] parameters
Parameter | Description | Required | Values | Default
--- | --- | --- | --- | ---
type | The type of the button | optional | primary, secondary, success, info, warning, danger, link, outline-primary, outline-secondary, outline-success, outline-info, outline-warning, outline-danger | primary
block | Flag whether the button should be a block-level button | optional | :triangular_flag_on_post: (flag) | false
disabled | Flag whether the button be disabled | optional | :triangular_flag_on_post: (flag) | false
size | The size of the button | optional | sm, lg | none
class | Any extra classes you want to add | optional | any text | none
data | Data attribute and value pairs separated by a comma. Pairs separated by pipe. | optional | any text | none

[Bootstrap button documentation](http://getbootstrap.com/components/buttons/)

* * *

### Button Groups
Remember that `[button]` must wrap an `a`, `button`, or `input` tag inserted via the WordPress editor.

#### Basic example
    [button-group]
      [button type="secondary"] --LINK-- [/button]
      [button type="secondary"] --LINK-- [/button]
      [button type="secondary"] --LINK-- [/button]
    [/button-group]

Set the `vertical` flag to make the buttons appear vertically stacked rather than horizontally.

    [button-group]
      [button type="secondary"] --LINK-- [/button]
      [button type="secondary"] --LINK-- [/button]
      [button type="secondary"] --LINK-- [/button]
    [/button-group]

#### Button toolbar
    [button-toolbar]
      [button-group]
        [button type="secondary"] --LINK-- [/button]
        [button type="secondary"] --LINK-- [/button]
        [button type="secondary"] --LINK-- [/button]
      [/button-group]
        [button-group]
        [button type="secondary"] --LINK-- [/button]
        [button type="secondary"] --LINK-- [/button]
        [button type="secondary"] --LINK-- [/button]
      [/button-group]
      [button-group]
        [button type="secondary"] --LINK-- [/button]
      [/button-group]
    [/button-toolbar]

#### [button-group] parameters
Parameter | Description | Required | Values | Default
--- | --- | --- | --- | ---
size | The size of the button group | optional | sm, lg | none
vertical | Whether button group is vertical | optional | :triangular_flag_on_post: (flag) | false
class | Any extra classes you want to add | optional | any text | none
data | Data attribute and value pairs separated by a comma. Pairs separated by pipe. | optional | any text | none

#### [button-toolbar] parameters
Parameter | Description | Required | Values | Default
--- | --- | --- | --- | ---
class | Any extra classes you want to add | optional | any text | none
data | Data attribute and value pairs separated by a comma. Pairs separated by pipe. | optional | any text | none

[Bootstrap button groups documentation](http://getbootstrap.com/components/button-group/)

* * *

### Cards

	[card]
	  ...
	  [card-block]
	    [card-title]

	      --HEADING--

	    [/card-title]
	    [card-subtitle]

	      --HEADING--

	    [/card-subtitle]
	    ...
	  [/card-block]
	[/card]

Image caps are supported with the `[card-img]` shortcode and the `top` or `bottom` flag

	[card]
	  [card-img top]

	    --IMAGE--

	  [/card-img]
	  [card-block]
	    [card-title]

	      --HEADING--

	    [/card-title]
	    ...
	  [/card-block]
	[/card]

Image overlay cards are supported with the `[card-img-overlay]` shortcode.

		[card]
		  [card-img]

		    --IMAGE--

		  [/card-img]
		  [card-img-overlay]
		    [card-title]

		      --HEADING--

		    [/card-title]
		    ...
		  [/card-img-overlay]
		[/card]

Card header and card footers are supported with the `[card-header]` and `[card-footer]` shortcodes.

		[card]
		  [card-header]

		    --HEADING--

		  [/card-header]
			[card-block]
		    [card-title]

		      --HEADING--

		    [/card-title]
		    ...
		  [/card-block]
			[card-footer]
			  ...
		  [/card-footer]
		[/card]

#### [card] parameters
Parameter | Description | Required | Values | Default
--- | --- | --- | --- | ---
type | Contextual background color for the card | optional | primary, success, info, warning, danger, outline-primary, outline-secondary, outline-success, outline-info, outline-warning, outline-danger | none
inverse | Flag whether to invert the text color for contextual backgrounds | optional | :triangular_flag_on_post: (flag) | false
class | Any extra classes you want to add | optional | any text | none
data | Data attribute and value pairs separated by a comma. Pairs separated by pipe. | optional | any text | none

#### [card-block] parameters
__NOTE: Any `p` or `blockquote` tags within [card-block] will automatically receive card-text or card-blockquote classes respectively__

Parameter | Description | Required | Values | Default
--- | --- | --- | --- | ---
class | Any extra classes you want to add | optional | any text | none
data | Data attribute and value pairs separated by a comma. Pairs separated by pipe. | optional | any text | none

#### [card-title] parameters
__NOTE: `[card-title]` should contain a heading tag (`h1`, `h2`, `h3`, `h4`, `h5`, or `h6`), inserted using the WordPress editor. If a heading tag is not added `h4` will be inserted automatically__

Parameter | Description | Required | Values | Default
--- | --- | --- | --- | ---
class | Any extra classes you want to add | optional | any text | none
data | Data attribute and value pairs separated by a comma. Pairs separated by pipe. | optional | any text | none

#### [card-subtitle] parameters
__NOTE: `[card-subtitle]` should contain a heading tag (`h1`, `h2`, `h3`, `h4`, `h5`, or `h6`), inserted using the WordPress editor. If a heading tag is not added `h6` will be inserted automatically__

Parameter | Description | Required | Values | Default
--- | --- | --- | --- | ---
class | Any extra classes you want to add | optional | any text | none
data | Data attribute and value pairs separated by a comma. Pairs separated by pipe. | optional | any text | none

#### [card-img] parameters
__NOTE: `[card-img]` should contain an image, or linked image, inserted using the WordPress TinyMCE editor__

Parameter | Description | Required | Values | Default
--- | --- | --- | --- | ---
top | Flag whether this image cap is at the top of the card | optional | :triangular_flag_on_post: (flag) | false
bottom | Flag whether this image cap is at the bottom of the card | optional | :triangular_flag_on_post: (flag) | false
class | Any extra classes you want to add | optional | any text | none
data | Data attribute and value pairs separated by a comma. Pairs separated by pipe. | optional | any text | none

#### [card-img-overlay] parameters
Parameter | Description | Required | Values | Default
--- | --- | --- | --- | ---
class | Any extra classes you want to add | optional | any text | none
data | Data attribute and value pairs separated by a comma. Pairs separated by pipe. | optional | any text | none

#### [card-header] parameters
__NOTE: `[card-header]` should contain a heading tag (`h1`, `h2`, `h3`, `h4`, `h5`, or `h6`), inserted using the WordPress editor. If a heading tag is not added `div` (no heading) will be inserted automatically__

Parameter | Description | Required | Values | Default
--- | --- | --- | --- | ---
class | Any extra classes you want to add | optional | any text | none
data | Data attribute and value pairs separated by a comma. Pairs separated by pipe. | optional | any text | none

#### [card-footer] parameters
Parameter | Description | Required | Values | Default
--- | --- | --- | --- | ---
class | Any extra classes you want to add | optional | any text | none
data | Data attribute and value pairs separated by a comma. Pairs separated by pipe. | optional | any text | none
