# GitHub Pages OSM PBF

This repository exists to track an experiment that I plan on doing which has to
do with seeing how much of the OpenStreetMap's planet PBF data can I fit into a
repository with associated GitHub Pages such that a file-server based OSM client
could function on this simplified subset. The idea is to simplify shapes and
compress data such that as much as possible from the original planet data fits
into the repository. I might decide to limit this to a country to prove the
concept where forking the repository and changing the country code would result
into a variant for a different country.

The OpenStreetMap PBF can be downloaded here: https://planet.openstreetmap.org/pbf

Geofabrik provides PBF extracts for various countries, e.g.: the Czech Republic:
https://download.geofabrik.de/europe/czech-republic.html

This PBF happens to be less than a gigabyte in size, which is already below the
GitHub repository size limit, so in this case no PBF processing would even be
needed: https://help.github.com/en/articles/what-is-my-disk-quota.

GitHub Pages support range requests: https://github.com/tomashubelbauer/fetch-range-request
This means that a progressive PBF reader could be used to implement an OSM view
in the browser with just a static file server.

## Running

Run a local file server and access it. This is needed for ESM in the browser,
which is not supported on the `file` protocol due to CORS. E.g.:

```sh
python3 -m http.server
# http://localhost:8000
```

## To-Do

### Consider possible approaches usable to bring the PBFs below the repo limits

The repository limit is 1 GB: https://help.github.com/en/articles/what-is-my-disk-quota
We could look into shape simplification and feature reduction to bring PBF sizes
down for the extract which need it.

### Develop a web app for rendering the vectors

### Develop the PBF viewer to build the map rendered upon

https://wiki.openstreetmap.org/wiki/PBF_Format

### Set up updating the PBF to latest daily using GitHub Actions and no history

The Czech Republic PBF from Geofabrik should fit within the repository, but it
must not have any history, so `filter-branch` should be used to ensure it does
not grown beyond the limit due to its history.

Use git-sizer to check on the repository size metrics in the GitHub Actions log:
https://github.com/github/git-sizer

### Detect inability to download the PBF using ranged requests

Right now the app only accepts the PBF through the `input[type=file]` element.
This is for development while the PBF is not a part of the repository. Once it
is, the app should detect whether it is able to load the PBF using a ranged
fetch request and if not, fallback to the `input`. This will make development
easy without having to use a local file server capable of ranged requests.
The Python HTTP module I am using doesn't support those and I don't want to have
to install a special file server that does, so instead I will load the file this
way. The browser will remember the selected file so it is very seamless.

### Figure out the structure of the PBF stream and the compression used in data

The `OSMData` blobs seem to be compressed if I'm reading the OSM wiki article
correctly, but I don't know how.
