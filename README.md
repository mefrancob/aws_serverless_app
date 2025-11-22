# Aplicación Web Serverless de Gestión de Tareas
Proyecto final para el curso de Computación en la Nube. El objetivo es diseñar, desarrollar y desplegar una aplicación web completa de tipo "To-Do List" utilizando una arquitectura 100% serverless en Amazon Web Services (AWS).

## Descripción del Proyecto
Esta aplicación permite a los usuarios registrarse, iniciar sesión de forma segura y gestionar sus propias listas de tareas. Cada usuario tiene acceso únicamente a sus datos, garantizando la privacidad y el aislamiento. El proyecto abarca todo el ciclo de vida del desarrollo de software en la nube, desde el diseño de la arquitectura y la implementación del frontend y backend, hasta el despliegue automatizado y la configuración de buenas prácticas de seguridad y monitoreo.
El enfoque principal es demostrar la eficiencia, escalabilidad y rentabilidad de las arquitecturas serverless para construir aplicaciones web modernas.
## Arquitectura Tecnológica
La solución se basa en un stack tecnológico serverless nativo de AWS, desacoplando el frontend del backend para maximizar la flexibilidad y la escalabilidad.
### Stack Tecnológico
Frontend: React.js
Backend: Node.js (Funciones AWS Lambda)
Infraestructura como Código (IaC): AWS SAM (Serverless Application Model)
Plataforma Cloud: Amazon Web Services (AWS)
### Servicios de AWS Utilizados
Hosting y Distribución:
Amazon S3: Para el alojamiento de los archivos estáticos del frontend (React).
Amazon CloudFront: Como CDN para una entrega de contenido rápida y segura (HTTPS).
Cómputo (Backend):
AWS Lambda: Para ejecutar la lógica de negocio sin gestionar servidores.
API y Autenticación:
Amazon API Gateway: Para exponer las funciones Lambda como una API RESTful segura.
Amazon Cognito: Para la gestión completa del ciclo de vida de los usuarios (registro, login, JWT).
Base de Datos:
Amazon DynamoDB: Como base de datos NoSQL, serverless y de alto rendimiento para almacenar las tareas.
