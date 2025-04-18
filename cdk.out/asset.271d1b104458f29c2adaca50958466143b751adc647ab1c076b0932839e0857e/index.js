var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/services/swagger/handler.ts
var handler_exports = {};
__export(handler_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(handler_exports);

// src/services/swagger/swagger.json
var swagger_exports = {};
__export(swagger_exports, {
  default: () => swagger_default,
  info: () => info,
  openapi: () => openapi,
  paths: () => paths
});
var openapi = "3.0.0";
var info = {
  title: "Star Wars Challenge API",
  version: "1.0.0",
  description: "API para fusionar datos de SWAPI con misiones y usuarios"
};
var paths = {
  "/swapi": {
    get: {
      summary: "Obtener personaje de Star Wars (y su \xFAltima misi\xF3n)",
      description: "Fusiona datos de SWAPI con misiones aleatorias. Usa cach\xE9 si est\xE1 disponible.",
      parameters: [
        {
          in: "query",
          name: "id",
          required: true,
          schema: {
            type: "string"
          },
          description: "ID del personaje de Star Wars (ej. 1)"
        }
      ],
      responses: {
        "200": {
          description: "Datos del personaje",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  id: {
                    type: "string"
                  },
                  name: {
                    type: "string"
                  },
                  height: {
                    type: "number"
                  },
                  mass: {
                    type: "number"
                  },
                  hair_color: {
                    type: "string"
                  },
                  skin_color: {
                    type: "string"
                  },
                  eye_color: {
                    type: "string"
                  },
                  birth_year: {
                    type: "string"
                  },
                  gender: {
                    type: "string"
                  },
                  homeworld: {
                    type: "string"
                  }
                }
              }
            }
          }
        },
        "400": {
          description: "Falt\xF3 el par\xE1metro `id`"
        },
        "500": {
          description: "Error interno"
        }
      }
    }
  },
  "/record": {
    get: {
      summary: "Listar todos los personajes almacenados",
      responses: {
        "200": {
          description: "Lista de personajes",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: {
                      type: "string"
                    },
                    name: {
                      type: "string"
                    },
                    height: {
                      type: "number"
                    },
                    mass: {
                      type: "number"
                    },
                    hair_color: {
                      type: "string"
                    },
                    skin_color: {
                      type: "string"
                    },
                    eye_color: {
                      type: "string"
                    },
                    birth_year: {
                      type: "string"
                    },
                    gender: {
                      type: "string"
                    },
                    homeworld: {
                      type: "string"
                    }
                  }
                }
              }
            }
          }
        },
        "500": {
          description: "Error interno"
        }
      }
    }
  },
  "/users": {
    post: {
      summary: "Registrar un nuevo usuario del challenge",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                username: {
                  type: "string"
                }
              }
            }
          }
        }
      },
      responses: {
        "201": {
          description: "Usuario registrado"
        },
        "400": {
          description: "Datos inv\xE1lidos"
        },
        "500": {
          description: "Error interno"
        }
      }
    }
  }
};
var swagger_default = {
  openapi,
  info,
  paths
};

// src/services/swagger/handler.ts
var handler = async () => {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(swagger_exports)
  };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
