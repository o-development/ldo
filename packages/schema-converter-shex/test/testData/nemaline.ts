import type { TestData } from "./testData.js";

/**
 * NEMALINE MYOPOTHY STUDY
 */
export const nemaline: TestData = {
  name: "nemaline",
  shexc: `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX gist: <https://w3id.org/semanticarts/ns/ontology/gist/>
PREFIX ox: <https://paediatrics.ox.ac.uk/terms/>

# ---------------------------------------------------------
# Shape: Assessment Event (The Row)
# Represents the "Snapshot" of the evaluation.
# ---------------------------------------------------------
ox:AssessmentEventShape {
    a [gist:Determination] ;

    # Identification (The 'Id' column)
    gist:isIdentifiedBy @ox:IDShape ;

    # The Subject being evaluated
    gist:hasParticipant @ox:SubjectShape ;

    # The Result (Total MFM Score)
    # Modeled as a produced content/value
    gist:produces @ox:TotalScoreResult ;

    # The 5 sub-tasks (V1 - V5)
    # Modeled as parts of the main event
    gist:hasPart @ox:TaskPerformanceShape {5} ;
    
    # "Below average" flag
    # Modeled as a tag or category if present
    gist:isCategorizedBy [ox:BelowAverage] ? ;
}

# ---------------------------------------------------------
# Shape: Subject (The Person)
# Derived from the row's demographic columns
# ---------------------------------------------------------
ox:SubjectShape {
    a [gist:Person] ;

    # Demographics
    gist:isCategorizedBy [ox:C1 ox:C2 ox:C3] ;
    gist:isCategorizedBy [ox:variant1 ox:variant2 ox:variant3] ;
    gist:isCategorizedBy [ox:Left ox:Right] ? ;

    # Ambulation Status (Baseline_loA_status)
    gist:isCategorizedBy @ox:AmbulationStatusCategory ;

    # Loss of Ambulation Age (LoA Age)
    # Only exists if applicable (Non-Ambulant)
    gist:hasMagnitude @ox:LoAAgeMagnitude ? ;

    # Age at Assessment (Baseline_Age)
    # Note: Age is dynamic, but recorded here as a snapshot magnitude
    gist:hasMagnitude @ox:AgeAtAssessmentMagnitude ;
}

# ---------------------------------------------------------
# Shape: Task Performance (V1-V5 Columns)
# Pairs a Time (Time_Vx) with a Score (MFM_Vx)
# ---------------------------------------------------------
ox:TaskPerformanceShape {
    a [gist:Event] ; # A sub-event or task

    # The Score for this specific task (MFM_V1...)
    gist:produces {
        a [gist:Content] ;
        gist:hasMagnitude @ox:MFMSubScoreMagnitude ;
     } ;

    # The Time offset/duration for this task (Time_V1...)
    gist:hasMagnitude @ox:TimeOffsetMagnitude ;
}

# ---------------------------------------------------------
# Shape: Total Score Result
# Represents 'total MFM' column
# ---------------------------------------------------------
ox:TotalScoreResult {
    a [gist:Content] ;
    gist:hasMagnitude {
        a [gist:Magnitude] ;
        gist:hasAspect [ox:Aspect_TotalMFM] ;
        gist:numericValue xsd:integer ;
    }
}

# ---------------------------------------------------------
# Helper Shapes (Magnitudes & Categories)
# ---------------------------------------------------------

ox:IDShape {
    a [gist:ID] ;
    gist:uniqueText xsd:string ;
}

ox:AgeAtAssessmentMagnitude {
    a [gist:Magnitude] ;
    gist:hasAspect [ox:Aspect_Age] ;
    gist:numericValue xsd:decimal ;
}

ox:LoAAgeMagnitude {
    a [gist:Magnitude] ;
    gist:hasAspect [ox:Aspect_AgeOfOnset] ;
    gist:numericValue xsd:decimal ;
}

ox:MFMSubScoreMagnitude {
    a [gist:Magnitude] ;
    gist:hasAspect [ox:Aspect_MFM_SubScore] ;
    gist:numericValue xsd:integer ;
}

ox:TimeOffsetMagnitude {
    a [gist:Magnitude] ;
    gist:hasAspect [ox:Aspect_TimeOffset] ;
    gist:numericValue xsd:decimal ;
}
  `,
  sampleTurtle: "",
  baseNode: "",
  successfulContext: {},
  successfulTypings: "",
};
