## Demo
https://github.com/user-attachments/assets/82613c9d-d24f-4711-b95a-da4ba6bfbff2

## Unit Test Results
<img width="954" alt="image" src="https://github.com/user-attachments/assets/a470e9f4-a69c-4f3e-b6be-8a22dcb11057" />

## E2E Tests
Will add if have more time
- [ ] should show the images on UI if uploaded
- [ ] should render image on canvas if dragged and dropped
- [ ] should delete the selected image by keyboard and context menu
- [ ] should move the selected image by keyboard and context menu

## Main Features

- [x] User must see the existing images from folder `images` to the images list
  - Set `loading="lazy"` to lazy load the images
- [x] User can _upload image_ to folder `images` and the list must update accordingly
  - Only render the newly uploaded image, not re-render the list
- [x] User can _add image / text_ from the sidebar to the canvas
  - Support only image, text will be done later if have more time
- [x] User can _move and delete the image / text_ inside the canvas
  - Right click to see context menu
  - Support both mouse and keyboard
  - Apply throttle to improve performance
- [x] The created objects on canvas can be saved and repopulated even if we refresh the browser!
  - Take advantages of VueUse - useLocalStorage

## Additional Features

- [x] Throttle the drag event to improve performance but still keep the movement smooth (16ms ~ 60FPS)
- [x] Delete an image by Pressing Delete/Backspace key
- [x] Move an image by pressing arrow keys (move faster if holding Shift key)
- [ ] Delete uploaded images
- [ ] Hold Cmd/Control + click to select multi images then can move or delete multi images
- [ ] Select multi images by mouse
- [x] Right click should show list of actions on as a context menu
- [x] Duplicate feature (right click to see the action): allow duplicate a selected image, don't need to copy & paste
- [x] Bring to front feature

## How to run

Install packages

```
npm install
```

Run server

```
npm run be
```

Run the app

```
npm run fe
```

Access http://localhost:5173/
