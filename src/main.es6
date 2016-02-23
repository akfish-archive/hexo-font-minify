import Generator from "./generator";

export default function(hexo) {
  let generator = new Generator(hexo);
  generator.register();
}
