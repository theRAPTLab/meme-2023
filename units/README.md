# Units

Units are defined as a folder. 
- You can have as many units as you want.
- Resources are stored in `resources` folders in each unit folder
- MEME will happily gulp down every `*.yaml` file and combine them all together.

```
/units
  /wetlands            # folder name works as id
    wetlands.yaml 
    /resources
      fish.pdf
      marsh.pdf
  /beavers
    beavers.yaml
    /resources
      beaver.pdf
      trees.pdf
      dam.pdf      
```

## Units YAML Data Structure

The basic unit yaml file consists of four objects: `label`, `resources`, `ratings`, and `commentTypes`.

`units/exampleUnit/example.yaml`
```yaml
label: 'Example Unit'
resources: [...]
ratings: [...]
commentTypes: [...] 
```

> [!TIP]
> Pro Tip
> Because the app will load all yaml files, you can split out the sections into separate files.
>
> e.g. 
> - `units/demo/baseunit.yaml` -- with main `label` and `ratings`
> - `units/demo/resources.yaml` -- with only the `resources` object
> - `units/demo/commentTypes.yaml` -- with only the `commentTypes` object
>
> And then you can easily copy the files to other units.
> Use caution though because if you re-define one of the objects, they can clobber each other.


#### `resources`
Resources are an array consisting of 5 items:
- `id` -- numeric id used for the footnote
- `label` -- human readable label for the evidence
- `notes` -- a short descriptive string displayed below the label in the library
- `type` -- a string description for humans, e.g. `report, simulation, idea, assumption, question, or other'` (this is not programmatic)
- `url` -- A filename reference or a URL.

Note on use:
- The `id` is used as the footnote reference.
- The order of items in the Evidence Library is determined by the order of the items in the unit definition.

e.g. "Fish" will appear first in the Evidence Library because it's the first item in the array.  When you create an evidence link for "Fish" it will use `2a` because the `id` is 2.
```yaml
resources:
  - id: 2
    label: 'Fish'
    notes: 'Aquatic creatures.'
    type: 'pdf'
    url: 'Resource 1_Habits of the New Fish.pdf'
  - id: 1
    label: 'Algae'
    notes: 'Food source.'
    type: 'pdf'
    url: 'Resource 5_Water Quality Report.pdf'
```

#### `ratings`
Ratings are an array of 3 items:
- `label` -- human readable label for the rating
- `rating` -- a numeric value, generally from positive to negative
- `svgdefKey` -- this points to the SVG icon

`svgdefKey` values:
- `ratingsAgreeStrongly`
- `ratingsAgree`
- `ratingsNone`
- `ratingsDisagree`
- `ratingsDisagreeStrongly`

```yaml
ratings:
  - label: 'Algae Agrees'
    rating: 1
    svgdefKey: 'ratingsAgree'
  - label: 'Algae None'
    rating: 0
    svgdefKey: 'ratingsNone'
  - label: 'Algae Disagrees'
    rating: -1
    svgdefKey: 'ratingsDisagree'
```

#### `commentTypes`
Comment Types are arrays with 3 items:
- `slug` -- a comment type id
- `label` -- human readable label for the comment type -- this is displayed in the comment type selector dropdown
- `prompts` -- an array of prompts that define one or more questions with either text answers or dropdown menu answers.

You can find other example comment types in the `DEFAULT_CommentTypes` constant in `dc-comments.js`.  Just copy the same format, switching JSON to YAML.

```yaml
commentTypes:
  - slug: 'cmt'
    label: 'Comment'
    prompts:
      - format: 'text'
        prompt: 'Comment'
        help: 'Use this for any general comment.'
        feedback: ''
  - slug: 'evidence'
    label: 'Backed up by enough good evidence'
    prompts:
      - format: 'dropdown'
        prompt: 'Is this based on evidence and facts?'
        options:
          - 'Yes'
          - 'Some'
          - 'No'
        helpIgnore: 'Select one.'
      - format: 'text'
        prompt: 'What would you change?'
        help: "Please list specific evidence or facts, and how you'd change the model."
        feedback: ''
```




## Using Units

A few key points:
- Units are loaded when the MEME app is started (e.g. via `npm start` or `npm run dev`).
- Currently changes to units while the server is running are not detected, so if you make changes, you will need to restart the server.
- Units are determined by a `unitId` variable that is stored with the model.  The `unitId` is the folder name.
> [!CAUTION]
> Don't arbitrarily change the unit folder name!  This might detach the model from the unit!

Validation
The unit yaml files will do basic validation when the app loads, checking:
- Required fields are present
- Field types (string, integer, etc)
- Valid folder names (no spaces, letters, numbers, underscore, and hyphen only)

