# Karkas

## Tutorial

### 1. HTML and JS

Create an HTML file, and include there **karkas.js** file.


### 2. Create an template

To define a new template, create a new **template** tag. This block can be placed anywhere on page.
Also you have to give a name for template with **name** attribute, for example:

```
<script type="template/karkas" name="myFirstTemplate">
</script>
```

Also you can insert template as string by JavaScript API:
```
// Create template instance
var template = new karkas.View('<b>Name:</b> {{name}}', 'myTemplate');

// Register template
template.apply();
```
Or use existing HTML element:
```
var tpl = new karkas.View(document.querySelector('.item'), 'myTemplate');
```

### 3. Add content and variables

Inside template, you can place a regular HTML markup and variables, placed in moustache. Variable name must be the same as a key of array/object.

For example, this array:
```
[
	{
		id: 0,
		name: "Andrew",
		lastname: "Johnson",
		date: {
			day:2,
			month:"July",
			year:2010
		}
	},
	{
		id: 1,
		name: "Lorem",
		lastname: "Lipsum",
		date: {
			day:1,
			month:"January",
			year:2014
		}
	}
] 

```

Can be parsed with this template:

```
<script type="template/karkas" name="myTemplate">
	<a href="site.com/user{{id}}">{{name}} {{lastname}} ({{id}})</a>
	<p>{{date.day}} {{date.month}} {{date.year}}</p>
</script>
```

### 4. Parsing data

You can directly compile data using **karkas.compile**.
It will return a compiled HTML as string, but also it allows to output result directly to HTML elements.
You can use it to parse an array of objects or a single object.

Parse an array of objects directly to DIV:

```
karkas.compile("myTemplate",arrayOfObjects,"#container",true);
```
The last parameter, allows to you overwrite or append result to HTML tag.


Just parse a single object and return data to variable:

```
var compiledHTML = karkas.compile("myTemplate",singleObject);
```

Also you can store all templates in separate file (see **Including remote templates**).
#### Unpacking simple arrays
To unpack a simple array of strings or numbers, you can use `this` variable in templates:
```
<script type="template/karkas" name="1">
	<a href="{{this}}">{{this}}</a>
</script>
```
Also you can use `this` as object instance inside your templates.

### 5. Filters

You can filter values inside template using filters.
Karkas has several embedded filters:

* **currency** - convert number to currency expresssion (ex. 2.5 => "$ 2.50").
* **json** - stringify object to JSON.
* **capitalize** - capitalize string.
* **toLower** - to lower case.
* **toUpper** - to upper case.

Full list of filters and manual are available in `FILTERS.MD` file.

#### Filters usage

To use filter for expression, add vertical line filter after object field and filter name inside expression:
```
<script type="template/karkas" name="demo">
    <div class="item">
        <b>{{name}}</b>: <span>{{price|currency}}
    </div>
</script>
```

Some filters can have additional arguments, for example - `currency` filter has currency symbol as optional argument:
```
<script type="template/karkas" name="demo">
    <div class="item">
        <b>{{name}}</b>: <span>{{price|currency:"€"}}
    </div>
</script>
```
All arguments have come after filter name, and separated by coma.
Only scalar types, strings and booleans are acceptable as filter arguments.

#### Custom filters

All filters are presented as functions and stored inside Karkas.
To create a new filter, you can use `karkas.filters.add` function.

**Example**
```
karkas.filters.add("myFilter", function(value, argument1, argument2) {
    // Check if first argument is defined
        if(typeof argument1 == "undefined") console.log("there is no argument1");
        
    // return filtered value
        return value.toUpperCase();
    });
```

First argument of filter function it's a expression value.
All additional arguments will be passed after it.

### 6. Use one template inside another
Karkas allows to embed one template inside other.
To do it, just use the same syntax as for filters, but type template name instead filter:

```
<!-- image template -->
<script type="template/karkas" name="image-template">
    <div class="img-responsive">
        <img src="{{image}}" alt="{{title}}" />
    </div>
</script>


<!-- here is post template, here we will use image-template inside it to parse image -->
<script type="template/karkas" name="post">
    <article class="post">
        <section>{{title}}</section>
        
        <!-- use object instance to parse image inside -->
        {{this|image-template}}
        
        <p>{{text}}</p>
        <a href="{{link}}">Read</a>
    </article>
</script>

```

### 6. Store templates in separate files
Karkas allows to you to save your templates in files, and include them on demand using AJAX.
Example of including templates is available in **ajax-template-example.html** file and require an HTTP server.

A simple example of including a template and parsing data using it:

**index.html (with Promise support):**
```
karkas.include("template.html").then(function(){
    karkas.compile("listTemplate",data,"#container",true);
}).catch(function (err) {
    console.error('Augh, there was an error!', err.statusText);
});
```

**index.html (Regular callback):**
```
karkas.include("template.html", function(){
    karkas.compile("listTemplate",data,"#container",true);
});
```

**template.html**
```
<script type="template/karkas" name="listTemplate">
{{data}}
</script>

<!--this file can contain a multiple templates-->
<script type="template/karkas" name="menuTemplate">
{{data}}
</script>

```
