# Three.js r180

Version: 0.180.0. License: MIT (see LICENSE).

Vendored from the published three package:
- https://unpkg.com/three@0.180.0/build/three.module.min.js
- https://unpkg.com/three@0.180.0/build/three.core.min.js
- https://unpkg.com/three@0.180.0/examples/jsm/renderers/CSS3DRenderer.js

The CSS3DRenderer import is changed from `three` to `./three.module.min.js` so the website runs without a build step or a runtime CDN dependency.

Camera and CSS renderer documentation: https://threejs.org/docs/
