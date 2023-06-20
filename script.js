(async () => {
  // Load model
  await faceapi.nets.ssdMobilenetv1.loadFromUri("models");
  await faceapi.nets.faceRecognitionNet.loadFromUri("models");
  await faceapi.nets.faceLandmark68Net.loadFromUri("models");

  // Detect Face
  const input = document.getElementById("myImg");
  const result = await faceapi
    .detectSingleFace(input, new faceapi.SsdMobilenetv1Options())
    .withFaceLandmarks()
    .withFaceDescriptor();
    console.log('Result ==>', result);
  const displaySize = { width: input.width, height: input.height };
  // resize the overlay canvas to the input dimensions
  const canvas = document.getElementById("myCanvas");
  faceapi.matchDimensions(canvas, displaySize);
  const resizedDetections = faceapi.resizeResults(result, displaySize);
  console.log('resizedDetections ==>',resizedDetections);

  // Recognize Face
  const labeledFaceDescriptors = await detectFace();
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.7);
  if (result) {
    console.log('Have match')
    const bestMatch = faceMatcher.findBestMatch(result.descriptor);
    console.log('Best matcher ==>',bestMatch );
    const box = resizedDetections.detection.box;
    const drawBox = new faceapi.draw.DrawBox(box, { label: bestMatch.label });
    drawBox.draw(canvas);
  }
})();

// detect for one people
async function detectFace() {
  const label = "Huu";
  const numberImage = 5;
  const descriptions = [];
  for (let i = 1; i <= numberImage; i++) {
    const img = await faceapi.fetchImage(
      `/data/Huu/${i}.jpg`
    );
    const detection = await faceapi
      .detectSingleFace(img)
      .withFaceLandmarks()
      .withFaceDescriptor();
    descriptions.push(detection.descriptor);
  }
  console.log('new faceapi.LabeledFaceDescriptors(label, descriptions);',new faceapi.LabeledFaceDescriptors(label, descriptions))
  return new faceapi.LabeledFaceDescriptors(label, descriptions);
}


// detect for more people
async function detectAllLabeledFaces() {
  const labels = ["An Nhien", "Huu"];
  return Promise.all(
    labels.map(async label => {
      const descriptions = [];
      for (let i = 1; i <= 2; i++) {
        const img = await faceapi.fetchImage(
          `/data/${label}/${i}.jpg`
        );
        const detection = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();
        descriptions.push(detection.descriptor);
      }
      return new faceapi.LabeledFaceDescriptors(label, descriptions);
    })
  );
}
