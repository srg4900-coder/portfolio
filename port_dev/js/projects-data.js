/*
  PROJECT DATA — the single source of truth for every case study's media.
  Shared by BOTH pages, so an image path only ever lives here:
    - project.html (js/project.js) injects the video + draggable cluster
      images for ?project=<slug>
    - index.html (js/paper-thumbs.js) shows each project's homepage paper
      thumbnail = thumbVideo if set, else the FIRST clusterImages entry
  Add a slug here as each case study's real assets are ready; a slug
  with no entry just shows the plain template / empty thumbnail holders.
*/
window.PROJECTS = {
  'art-direction': {
    title: 'Grassroots Fall 26',
    video: 'assets/video/jacket-love-story.mp4',
    // Homepage thumbnail: a silent 8s, 640x400 cut of the video above,
    // looped (a separate small file so the homepage never loads the 23MB
    // full video). Without thumbVideo, the first clusterImages entry is used.
    thumbVideo: 'assets/video/jacket-love-story-thumb.mp4',
    // Homepage thumbnail rotation (deg). The Art Direction paper rests
    // rotated -90deg, so +90 turns the image back upright on screen.
    thumbRotate: 90,
    // 6 images for the 6 Failures & Setbacks boxes — filled in document
    // order, left stack then right.
    clusterImages: [
      'assets/case-studies/art-direction/ad-01.jpg',
      'assets/case-studies/art-direction/ad-02.jpg',
      'assets/case-studies/art-direction/ad-03.jpg',
      'assets/case-studies/art-direction/ad-04.jpg',
      'assets/case-studies/art-direction/ad-05.jpg',
      'assets/case-studies/art-direction/ad-06.jpg'
    ]
  }
};
