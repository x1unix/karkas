# KarkasJS
A simple template engine for web apps

### Requirements
* Chrome, Firefox, Safari or Internet Explorer 8 or above

### Tutorial

Tutorial also included in **index.html** file

#### 1. HTML and JS

Create an HTML file, and include there **karkas.js** file before **</body>** tag.

#### 2. Create an template

To define a new template, create a new **template** tag. This block can be placed anywhere on page. Also you have to give a name for template with **name** attribute, for example:

```
<template name="myFirstTemplate">
</template>
```

#### 3. Add content and variables

Inside template, you can place a regular HTML markup and variables, placed in moustache. Variable name must be the same as a key of array/object.

For example, this array:
```
[
	{
		id: 0,
		name: "Andrew",
		lastname: "Johnson"
	},
	{
		id: 1,
		name: "Lorem",
		lastname: "Lipsum"
	}
] 

```

Can be parsed with this template:

```
<template name="myTemplate">
	<a href="site.com/user{{id}}">{{name}} {{lastname}} ({{id}})</a>
</template>
```

#### 4. Using template to parse data

You can access to your template by using **karkas.getView** function.
It will return a template object. You can use it to parse an array of objects or a single object. It will return a generated HTML as string.

Parse an array of objects:

```
var tpl = karkas.getView("myTemplate");
document.getElementById("someDiv").innerHTML = tpl.parseArray(arrayOfObjects);
```

Parse a single array (object) :

```
document.getElementById("someDiv").innerHTML = karkas.getView("myTemplate").parse(singleObject);
```