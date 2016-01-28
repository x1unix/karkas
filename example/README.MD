# KarkasJS

## Tutorial

#### 1. HTML and JS

Create an HTML file, and include there **karkas.js** file.


#### 2. Create an template

To define a new template, create a new **template** tag. This block can be placed anywhere on page.
Also you have to give a name for template with **name** attribute, for example:

```
<script type="template/karkas" name="myFirstTemplate">
</script>
```

#### 3. Add content and variables

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

#### 4. Parsing data

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

#### Unpacking simple arrays
To unpack a simple array of strings or numbers, you can use `this` variable in templates:

```
<script type="template/karkas" name="1">
	<a href="{{this}}">{{this}}</a>
</script>
```


## Including remote templates
Karkas allows to you to save your templates in files, and include them on demand using AJAX.
Example of including templates is available in **ajax-template-example.html** file and require an HTTP server.

A simple example of including a template and parsing data using it:

**index.html:**
```
karkas.include("template.html").then(function(){
    karkas.compile("listTemplate",data,"#container",true);
}).catch(function (err) {
    console.error('Augh, there was an error!', err.statusText);
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
