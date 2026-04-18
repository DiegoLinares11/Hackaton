"""
E4C Solutions Library Assessment Criteria
19 fields organized in 4 sections, based on real Product Reports.
"""

CRITERIA = {
    "snapshot": {
        "label": "Snapshot",
        "description": "Identidad y contexto general del producto",
        "fields": {
            "product_description": {
                "label": "Descripción del producto",
                "question": "¿Qué hace el producto, cómo funciona y qué problema resuelve?",
                "examples_complete": [
                    "Describe claramente la función, mecanismo y problema que aborda",
                    "Incluye contexto de uso y beneficiarios"
                ],
                "examples_partial": [
                    "Menciona el producto pero sin explicar cómo funciona",
                    "Descripción vaga sin problema específico"
                ],
                "feedback_partial": "Amplía la descripción explicando el mecanismo de funcionamiento y el problema específico que resuelve tu tecnología.",
                "feedback_missing": "Agrega una descripción clara que incluya: qué hace tu producto, cómo funciona técnicamente, y qué problema resuelve para el usuario final.",
                "weight": 1.0
            },
            "target_sdgs": {
                "label": "SDGs objetivo",
                "question": "¿Qué Objetivos de Desarrollo Sostenible (ODS) impacta directamente?",
                "examples_complete": [
                    "Lista SDGs específicos (ej: SDG 6: Clean Water)",
                    "Explica cómo contribuye a cada SDG"
                ],
                "examples_partial": [
                    "Menciona sostenibilidad sin SDGs específicos",
                    "Lista SDGs sin explicar la conexión"
                ],
                "feedback_partial": "Especifica los números de SDG (ej: SDG 6, SDG 7) y explica brevemente cómo tu tecnología contribuye a cada uno.",
                "feedback_missing": "Identifica los Objetivos de Desarrollo Sostenible que tu tecnología impacta. Consulta https://sdgs.un.org/goals para la lista completa.",
                "weight": 0.8
            },
            "suggested_price": {
                "label": "Precio sugerido de mercado",
                "question": "¿Cuál es el precio al consumidor/usuario final?",
                "examples_complete": [
                    "Precio específico con moneda (ej: $0.23 USD / 127 FCFA)",
                    "Rango de precios según modelo o región"
                ],
                "examples_partial": [
                    "Dice 'asequible' o 'bajo costo' sin número",
                    "Precio sin moneda o sin contexto"
                ],
                "feedback_partial": "Proporciona un precio numérico específico con la moneda. Si varía por región, incluye el rango y moneda local.",
                "feedback_missing": "Agrega el precio sugerido de mercado en USD y, si aplica, en moneda local del mercado objetivo.",
                "weight": 0.7
            },
            "target_users": {
                "label": "Usuarios objetivo",
                "question": "¿Para quién está diseñado el producto?",
                "examples_complete": [
                    "Grupo específico (ej: hogares rurales, agencias gubernamentales)",
                    "Perfil del usuario con contexto"
                ],
                "examples_partial": [
                    "Dice 'comunidades' sin especificar",
                    "Audiencia muy amplia sin segmentar"
                ],
                "feedback_partial": "Especifica el grupo objetivo con más detalle: ¿hogares individuales, comunidades, instituciones, gobierno?",
                "feedback_missing": "Define quiénes son los usuarios finales de tu tecnología y en qué contexto la usarían.",
                "weight": 0.8
            },
            "competitive_landscape": {
                "label": "Panorama competitivo",
                "question": "¿Qué competidores directos existen?",
                "examples_complete": [
                    "Nombra competidores específicos",
                    "Explica diferenciación"
                ],
                "examples_partial": [
                    "Dice 'no hay competencia' sin justificación",
                    "Menciona el mercado sin competidores específicos"
                ],
                "feedback_partial": "Nombra al menos 2-3 productos o soluciones competidoras y explica en qué se diferencia tu tecnología.",
                "feedback_missing": "Investiga y documenta los competidores directos en tu sector. El Solutions Library de E4C puede ayudarte a identificarlos.",
                "weight": 0.6
            },
            "countries_regions": {
                "label": "Países / regiones",
                "question": "¿En qué países o regiones opera o planea operar?",
                "examples_complete": [
                    "Lista de países específicos",
                    "Regiones con contexto de mercado"
                ],
                "examples_partial": [
                    "Dice 'África' o 'países en desarrollo' sin especificar",
                    "Un solo país sin mencionar planes de expansión"
                ],
                "feedback_partial": "Especifica los países exactos donde operas o planeas operar, no solo regiones generales.",
                "feedback_missing": "Indica los países o regiones donde tu tecnología está disponible o donde planeas desplegarla.",
                "weight": 0.7
            }
        }
    },
    "manufacturing_delivery": {
        "label": "Manufacturing & Delivery",
        "description": "Cómo se fabrica y llega al usuario",
        "fields": {
            "manufacturing_method": {
                "label": "Método de manufactura",
                "question": "¿Cómo se produce/fabrica el producto?",
                "examples_complete": [
                    "Describe el proceso de fabricación",
                    "Materiales y métodos de producción"
                ],
                "examples_partial": [
                    "Menciona 'fabricación local' sin detalles",
                    "Lista materiales sin proceso"
                ],
                "feedback_partial": "Describe el proceso de fabricación con más detalle: materiales principales, métodos de producción, y si se puede fabricar localmente.",
                "feedback_missing": "Documenta cómo se fabrica tu producto: materiales clave, proceso de manufactura, y capacidad de producción.",
                "weight": 0.7
            },
            "intellectual_property": {
                "label": "Propiedad intelectual",
                "question": "¿Qué tipo de protección IP tiene?",
                "examples_complete": [
                    "Especifica tipo: patente, open source, etc.",
                    "Número de patente o licencia"
                ],
                "examples_partial": [
                    "Dice 'protegido' sin especificar tipo",
                    "Menciona patente sin número"
                ],
                "feedback_partial": "Especifica el tipo exacto de protección: patente (con número), open source (con licencia), o IP protegida.",
                "feedback_missing": "Indica el estatus de propiedad intelectual: ¿es patentado, open source, o tiene otra protección?",
                "weight": 0.5
            },
            "user_provision_model": {
                "label": "Modelo de provisión al usuario",
                "question": "¿Cómo obtiene el usuario final el producto?",
                "examples_complete": [
                    "Canal de distribución claro (venta directa, distribuidores, gobierno)",
                    "Modelo de negocio (compra, alquiler, suscripción, PAYG)"
                ],
                "examples_partial": [
                    "Dice 'se vende' sin canal específico",
                    "Modelo de negocio sin detalles de acceso"
                ],
                "feedback_partial": "Detalla el canal de distribución: ¿venta directa, distribuidores, ONGs, gobierno? ¿Compra única, suscripción, PAYG?",
                "feedback_missing": "Explica cómo el usuario final obtiene tu producto: canales de distribución y modelo de pago.",
                "weight": 0.8
            },
            "distributions_to_date": {
                "label": "Distribución a la fecha",
                "question": "¿Cuántas unidades se han desplegado?",
                "examples_complete": [
                    "Número específico con fecha (ej: 3,768 unidades al 2021)",
                    "Datos de adopción verificables"
                ],
                "examples_partial": [
                    "Dice 'miles' sin número exacto",
                    "Datos sin fecha de referencia"
                ],
                "feedback_partial": "Proporciona un número específico de unidades distribuidas con la fecha de referencia.",
                "feedback_missing": "Documenta cuántas unidades de tu producto se han distribuido hasta la fecha, con datos verificables.",
                "weight": 0.7
            }
        }
    },
    "performance_use": {
        "label": "Performance & Use",
        "description": "Cómo funciona y se mantiene en campo",
        "fields": {
            "design_specifications": {
                "label": "Especificaciones de diseño",
                "question": "¿Cuáles son los detalles técnicos del producto?",
                "examples_complete": [
                    "Specs técnicas detalladas (dimensiones, capacidad, materiales)",
                    "Diagramas o esquemas del sistema"
                ],
                "examples_partial": [
                    "Specs básicas sin detalles completos",
                    "Descripción técnica vaga"
                ],
                "feedback_partial": "Completa las especificaciones técnicas con datos cuantitativos: dimensiones, capacidad, materiales, requisitos de instalación.",
                "feedback_missing": "Agrega especificaciones técnicas detalladas: dimensiones, capacidad, materiales principales, y requisitos de instalación.",
                "weight": 0.9
            },
            "performance_parameters": {
                "label": "Parámetros de rendimiento",
                "question": "¿Qué métricas medibles demuestran el rendimiento?",
                "examples_complete": [
                    "Métricas cuantificables (ej: flujo 5L/min, eficiencia 85%)",
                    "Datos de pruebas de campo"
                ],
                "examples_partial": [
                    "Dice 'eficiente' o 'de alto rendimiento' sin números",
                    "Métricas del fabricante sin validación"
                ],
                "feedback_partial": "Reemplaza descripciones cualitativas con métricas cuantificables. En vez de 'eficiente', indica el porcentaje o valor medido.",
                "feedback_missing": "Documenta los parámetros de rendimiento con datos medibles: eficiencia, capacidad, velocidad, u otras métricas relevantes a tu sector.",
                "weight": 1.0
            },
            "technical_support": {
                "label": "Soporte técnico",
                "question": "¿Qué capacitación y mantenimiento se requiere?",
                "examples_complete": [
                    "Plan de capacitación para usuarios/técnicos",
                    "Frecuencia y tipo de mantenimiento"
                ],
                "examples_partial": [
                    "Dice 'fácil de mantener' sin plan",
                    "Menciona soporte sin detalles"
                ],
                "feedback_partial": "Detalla el plan de soporte: ¿quién da mantenimiento? ¿Cada cuánto? ¿Se requiere capacitación especializada?",
                "feedback_missing": "Describe el plan de soporte técnico: capacitación requerida, frecuencia de mantenimiento, y quién es responsable.",
                "weight": 0.8
            },
            "replacement_components": {
                "label": "Componentes de reemplazo",
                "question": "¿Qué repuestos se necesitan y dónde se consiguen?",
                "examples_complete": [
                    "Lista de repuestos con disponibilidad",
                    "Frecuencia de reemplazo estimada"
                ],
                "examples_partial": [
                    "Menciona repuestos sin disponibilidad",
                    "Lista incompleta"
                ],
                "feedback_partial": "Completa la lista de repuestos indicando dónde se consiguen y con qué frecuencia se necesitan.",
                "feedback_missing": "Lista los componentes que necesitan reemplazo periódico, su disponibilidad local, y frecuencia estimada de cambio.",
                "weight": 0.6
            },
            "lifecycle": {
                "label": "Ciclo de vida",
                "question": "¿Cuánto dura el producto en condiciones normales?",
                "examples_complete": [
                    "Duración específica (ej: 10 años)",
                    "Condiciones de uso que afectan durabilidad"
                ],
                "examples_partial": [
                    "Dice 'duradero' sin años",
                    "Estimación sin condiciones"
                ],
                "feedback_partial": "Indica la duración esperada en años y las condiciones que pueden afectar la vida útil.",
                "feedback_missing": "Especifica la vida útil esperada del producto en años, basada en pruebas o estimaciones documentadas.",
                "weight": 0.7
            },
            "safety": {
                "label": "Seguridad",
                "question": "¿Existen riesgos conocidos o hazards?",
                "examples_complete": [
                    "Declara riesgos conocidos o ausencia de ellos",
                    "Medidas de seguridad implementadas"
                ],
                "examples_partial": [
                    "Dice 'seguro' sin justificación",
                    "Menciona seguridad sin detallar riesgos"
                ],
                "feedback_partial": "Explica por qué el producto es seguro o lista los riesgos conocidos con las medidas de mitigación implementadas.",
                "feedback_missing": "Documenta los aspectos de seguridad: riesgos conocidos, medidas de mitigación, o declaración de ausencia de hazards.",
                "weight": 0.8
            }
        }
    },
    "research_standards": {
        "label": "Research & Standards",
        "description": "Evidencia académica y cumplimiento normativo",
        "fields": {
            "academic_references": {
                "label": "Referencias académicas",
                "question": "¿Qué estudios, papers o patentes respaldan el producto?",
                "examples_complete": [
                    "Papers citados con autores y año",
                    "Patentes con número de referencia"
                ],
                "examples_partial": [
                    "Menciona 'estudios' sin citar",
                    "Referencias incompletas"
                ],
                "feedback_partial": "Completa las citas académicas con autores, título, año y fuente. Usa formato consistente.",
                "feedback_missing": "Agrega referencias a estudios, papers, o patentes que respalden tu tecnología. Si no hay publicaciones, indica las fuentes de evidencia disponibles.",
                "weight": 0.6
            },
            "regulatory_compliance": {
                "label": "Cumplimiento regulatorio",
                "question": "¿Qué normas o certificaciones cumple?",
                "examples_complete": [
                    "Normas específicas (ISO, CE, WHO, etc.)",
                    "Certificaciones obtenidas con fecha"
                ],
                "examples_partial": [
                    "Dice 'cumple normas' sin especificar cuáles",
                    "Certificación en proceso sin detalles"
                ],
                "feedback_partial": "Especifica las normas exactas que cumples (ej: ISO 9001, certificación WHO) con fecha de obtención.",
                "feedback_missing": "Indica qué normas, estándares o certificaciones cumple tu producto, o declara si están en proceso.",
                "weight": 0.7
            },
            "evaluation_methods": {
                "label": "Métodos de evaluación",
                "question": "¿Cómo se midió y validó el rendimiento?",
                "examples_complete": [
                    "Método de prueba descrito (lab, campo, terceros)",
                    "Protocolo de evaluación documentado"
                ],
                "examples_partial": [
                    "Dice 'probado en campo' sin metodología",
                    "Resultados sin método de prueba"
                ],
                "feedback_partial": "Describe la metodología de evaluación: ¿pruebas de laboratorio, campo, o terceros? ¿Qué protocolo se siguió?",
                "feedback_missing": "Documenta cómo se evaluó el rendimiento de tu producto: métodos de prueba, protocolo, y quién realizó las pruebas.",
                "weight": 0.7
            }
        }
    }
}


def get_all_fields():
    """Return a flat list of all field keys."""
    fields = []
    for section in CRITERIA.values():
        fields.extend(section["fields"].keys())
    return fields


def get_field_info(field_key):
    """Get the full info for a specific field."""
    for section_key, section in CRITERIA.items():
        if field_key in section["fields"]:
            return {
                "section": section_key,
                "section_label": section["label"],
                **section["fields"][field_key]
            }
    return None


def get_total_fields():
    return len(get_all_fields())
