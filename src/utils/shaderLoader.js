// utils/shaderLoader.js
import React from "react";
/**
 * Loads GLSL shader files as text
 * @param {string} shaderPath - Path to the shader file
 * @returns {Promise<string>} - Shader source code as string
 */
export async function loadShader(shaderPath) {
    try {
        const response = await fetch(shaderPath);
        if (!response.ok) {
            throw new Error(`Failed to load shader: ${shaderPath}`);
        }
        return await response.text();
    } catch (error) {
        console.error("Error loading shader:", error);
        throw error;
    }
}

/**
 * Loads multiple shaders concurrently
 * @param {Object} shaderPaths - Object with shader names as keys and paths as values
 * @returns {Promise<Object>} - Object with shader names as keys and source code as values
 */
export async function loadShaders(shaderPaths) {
    try {
        const shaderPromises = Object.entries(shaderPaths).map(async ([name, path]) => {
            const source = await loadShader(path);
            return [name, source];
        });

        const shaderEntries = await Promise.all(shaderPromises);
        return Object.fromEntries(shaderEntries);
    } catch (error) {
        console.error("Error loading shaders:", error);
        throw error;
    }
}

/**
 * Hook for loading shaders in React components
 * @param {Object} shaderPaths - Object with shader names as keys and paths as values
 * @returns {Object} - { shaders: Object|null, loading: boolean, error: Error|null }
 */
export function useShaders(shaderPaths) {
    const [shaders, setShaders] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        let isCancelled = false;

        const loadAllShaders = async () => {
            try {
                setLoading(true);
                setError(null);
                const loadedShaders = await loadShaders(shaderPaths);

                if (!isCancelled) {
                    setShaders(loadedShaders);
                    setLoading(false);
                }
            } catch (err) {
                if (!isCancelled) {
                    setError(err);
                    setLoading(false);
                }
            }
        };

        loadAllShaders();

        return () => {
            isCancelled = true;
        };
    }, [shaderPaths]);

    return { shaders, loading, error };
}
