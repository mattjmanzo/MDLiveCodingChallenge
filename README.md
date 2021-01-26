# MDLiveChallenge

## Getting Started

1. Install the latest version [Node.js](https://nodejs.org/en/) and confirm the installation was successful:

```shell
$ node -v
  v.14.15.4
```

2. Step into the project directory and run the following command:

```shell
$ node index.js
```

3. Send POST requests to http://localhost:8080/apps with an optional JSON body of this form:

```json
{
    "range": {
        "by": "name",
        "start": "my-app-001",
        "end": "my-app-050",
        "max": 10,
        "order": "asc"
    }
}
```

## Author

[Matt Manzo](https://github.com/mattjmanzo)