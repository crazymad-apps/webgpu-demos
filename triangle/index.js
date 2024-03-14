import { getTextFile } from "../utils/file.js";

async function main() {
  const triangleVertWGSL = await getTextFile("../shaders/triangle.vert.wgsl");
  const redFragWGSL = await getTextFile("../shaders/red.frag.wgsl");

  const canvas = document.getElementById("canvas");
  const adapter = await navigator.gpu.requestAdapter();
  const device = await adapter.requestDevice();

  const context = canvas.getContext("webgpu");

  const devicePixelRatio = window.devicePixelRatio;
  canvas.width = canvas.clientWidth * devicePixelRatio;
  canvas.height = canvas.clientHeight * devicePixelRatio;
  const presentationFormat = navigator.gpu.getPreferredCanvasFormat();

  context.configure({
    device,
    format: presentationFormat,
    alphaMode: "premultiplied",
  });
  console.log("presentation", presentationFormat);

  const pipeline = device.createRenderPipeline({
    layout: "auto",
    vertex: {
      module: device.createShaderModule({ code: triangleVertWGSL }),
    },
    fragment: {
      module: device.createShaderModule({ code: redFragWGSL }),
      targets: [{ format: presentationFormat }],
    },
    primitive: { topology: "triangle-list" },
  });

  function frame() {
    const commandEncoder = device.createCommandEncoder();
    const textureView = context.getCurrentTexture().createView();

    const renderPassDescriptor = {
      colorAttachments: [
        { view: textureView, clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 }, loadOp: "clear", storeOp: "store" },
      ],
    };

    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
    passEncoder.setPipeline(pipeline);
    passEncoder.draw(3);
    passEncoder.end();

    device.queue.submit([commandEncoder.finish()]);
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

main();
