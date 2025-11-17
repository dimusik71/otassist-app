-- CreateTable
CREATE TABLE "assessment_response" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assessmentId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "answer" TEXT,
    "notes" TEXT,
    "mediaUrl" TEXT,
    "mediaType" TEXT,
    "aiAnalysis" TEXT,
    "aiSuggestions" TEXT,
    "needsFollowUp" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "assessment_response_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "assessment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "assessment_response_assessmentId_questionId_key" ON "assessment_response"("assessmentId", "questionId");
