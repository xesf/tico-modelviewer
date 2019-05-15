#version 300 es
precision highp float;

in vec3 vPosition;
in vec3 vNormal;
in float vColor;
in vec3 vMVPos;

out vec4 fragColor;

#require "../../island/shaders/common/fog.frag"
#require "../../island/shaders/common/dither.frag"
#require "../../island/shaders/common/intensity.frag"

void main() {
    fragColor = vec4(fog(dither(vColor, intensity()).rgb), 1.0);
}
