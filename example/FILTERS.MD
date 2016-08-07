# Karkas
===

## Filters
You can filter values inside template using filters.
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
{{price|currency:"€"}}
```
**Syntax**: `{{value|filterName:argument1,argument2}}`


All arguments have come after filter name, and separated by coma.
Expression must not include space or tabs symbols.
Only scalar types, strings and booleans are acceptable as filter arguments.


### Embedded filters 

#### json
Stringify object to JSON expression.

**Value type**: `Object`;

#### capitalize
Capitalize string.

**Value type**: `Any` or `String`;

#### currency
Convert number to currency expresssion (ex. 2.5 => "$ 2.50").

**Value type**: `Integer`, `Float`;

**Arguments**
* **String** `currencySymbol` *optional* - Currency symbol;

#### string
Apply a method from `String` class to value.

**Value type**: `Any`, except `Object`;

**Arguments**:
* **String** `method` *required* - String method;

Filter can use more than one argument, according to called function.

**Example**:
```
<!-- display string length -->
{{title|string:"length"}}

<!-- substring first 15 chars -->
{{text|string:"substring",0,15}}
```

#### math
Call methods from `Math` JavaScript namespace.

**Value type**: `Integer`, `Float`;

**Arguments**:
* **String** `method` *required* - method name;

Filter can use more than one argument, according to called function.

