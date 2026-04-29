# CLAUDE.md

Diseñar y desarrollar una aplicación tipo dashboard de análisis energético para consumo eléctrico doméstico/industrial.
La aplicación debe permitir registrar consumo mensual en kWh separado por tarifa horaria:
•	Heures Creuses (HC) 
•	Heures Pleines (HP) 
Debe incluir un sistema de análisis comparativo entre los años 2025 y 2026.
Requisitos funcionales:
•	Gestión de datos mensuales estructurados por año 
•	Cálculo automático de métricas energéticas y económicas 
•	Comparación interanual avanzada (2025 vs 2026) 
•	Cálculo de variaciones porcentuales por categoría (HC, HP, total) 
Fórmulas económicas:
•	HC = consumo HC × 0,19008 €/kWh 
•	HP = consumo HP × 0,27436 €/kWh 
KPIs obligatorios:
•	Consumo total mensual 
•	Coste total mensual 
•	Participación HC/HP (%) 
•	Diferencia mensual HC vs HP 
•	Variación % mensual entre años 
Visualización:
•	Tabla dinámica por mes y año 
•	Gráficos de evolución temporal (consumo y coste) 
•	Comparación visual 2025 vs 2026 
Objetivo final:
Permitir al usuario analizar, comparar y optimizar su consumo eléctrico en función de la distribución HC/HP y su impacto económico.