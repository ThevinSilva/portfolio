import { useVideoTexture } from "@react-three/drei";

const VideoMaterial = ({ src }) => {
    const texture = useVideoTexture(src);
    return <meshStandardMaterial map={texture} toneMapped={false} />;
};

export default VideoMaterial;
