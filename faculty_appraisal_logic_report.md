
# Faculty Appraisal System Logic and Formulas Report

This document details the formulas, conditions, and logical flow used to calculate the Grand API Score for a faculty appraisal. It breaks down the evaluation into Parts II, III, and IV, explaining how the inputs map to the scoring criteria for both Basic Science faculties and Regular faculties.

---

## Overall Final Calculation: Grand API Score
The Grand API Score is calculated as a weighted average of three main parts:
- **Part II:** Teaching, Learning and Evaluation (Max Score: 350)
- **Part III:** R&D Contributions (Max Score: 170)
- **Part IV:** Administration & Contribution (Max Score: 180)

### Experience-Based Weighting System
The weighting assigned to each part depends on the faculty member's total experience (`service_years_mitm` + `previous_experience`):

1.  **Experience < 5 Years**
    - `Final Score = ((Part II Score / 350) * 0.70 + (Part III Score / 170) * 0.20 + (Part IV Score / 180) * 0.10) * 100`
2.  **5 <= Experience < 10 Years**
    - `Final Score = ((Part II Score / 350) * 0.60 + (Part III Score / 170) * 0.25 + (Part IV Score / 180) * 0.15) * 100`
3.  **Experience >= 10 Years**
    - `Final Score = ((Part II Score / 350) * 0.50 + (Part III Score / 170) * 0.30 + (Part IV Score / 180) * 0.20) * 100`

---

## Part II: Teaching, Learning and Evaluation (Max 350 points)
The Part II calculation includes common sections applied to all faculties, and conditionally evaluated sections based on whether the faculty belongs to the "Basic Science" department.

### Common Sections (For all faculties)
1.  **Section 7a: Subject Pass Percentage**
    - `Score = Average of ((Pass Percentage * 0.01) * 30) across all subjects`
    - *(i.e., For each subject, the maximum score is 30 points. If the pass percentage is 100%, the subject gets 30 points.)*
2.  **Section 7c: Direct Score**
    - `Score = User input score (floating point value)`
3.  **Section 7d: High Scorers**
    - `Score = Average of ((High Scorers / Total Passed) * 40) across all subjects`
    - *(i.e., For each subject, if there are passed students, you take the ratio of high scorers to passed students and multiply by 40.)*
4.  **Section 9a: Programs Organized/Attended**
    - Count of programs where name is filled.
    - `>= 3 programs` -> 45 points
    - `2 programs` -> 40 points
    - `1 program` -> 35 points
5.  **Section 9b: Direct Score**
    - `Score = User input score (floating point value)`
6.  **Section 9c: Other Programs/Certifications**
    - Count of programs where name is filled.
    - `>= 2 programs` -> 30 points
    - `1 program` -> 25 points

### Condition 1: Basic Science Department Faculty
If the faculty belongs to a basic science department:
1.  **Section BSH - Topper Rank:**
    - `Rank 1` -> 30 points
    - `Rank 2` -> 25 points
    - `Rank 3` -> 20 points
    - `Rank 4` -> 15 points
    - `Rank 5` -> 10 points
2.  **Section BSH - Vertical Progression Percentage:**
    - `>= 91%` -> 40 points
    - `81% to 90%` -> 35 points
    - `75% to 80%` -> 30 points
    - `61% to 74%` -> 25 points
    - `51% to 60%` -> 20 points
    - `41% to 50%` -> 15 points
    - `1% to 40%` -> 10 points
3.  **Section 8c (BSH) - FCD Count (First Class with Distinction):**
    - If `total_mentees > 0`, calculate `FCD Percentage = (FCD Count / Total Mentees) * 100`
    - `>= 60%` -> 40 points
    - `50% to 59%` -> 30 points
    - `40% to 49%` -> 20 points
    - `30% to 39%` -> 10 points
4.  **Section 8d:**
    - If `is_completed == 'yes'` -> 10 points

### Condition 2: Regular Faculty (Non-Basic Science)
If the faculty does NOT belong to a basic science department:
1.  **Section 8a:**
    - If `count >= 1` -> 40 points
2.  **Section 8b:**
    - `selectedOption == 'best_project'`:
        - Place `1` -> 60 points
        - Place `2` -> 55 points
        - Place `3` -> 50 points
    - `selectedOption == 'exhibited'`:
        - Status `won` -> 60 points
        - Status `exhibited` -> 40 points
    - `selectedOption == 'funded'`:
        - Amount `>= 5000` -> 60 points
        - Amount `> 0` -> 50 points
    - `selectedOption == 'publication'`:
        - Count `>= 1` -> 60 points
3.  **Section 8c (Regular) - Graduated Percentage:**
    - `>= 90%` -> 30 points
    - `81% to 89%` -> 25 points
    - `71% to 80%` -> 20 points
    - `61% to 70%` -> 15 points

**Note:** The total score for Part II is capped at a maximum of **350**.

---

## Part III: R&D Contributions (Max 170 points)
1.  **Journals Published:**
    - Count of journals where name is filled.
    - `>= 2 journals` -> 20 points
    - `1 journal` -> 15 points
2.  **Conferences Presented:**
    - `>= 3 conferences` -> 20 points
    - `2 conferences` -> 15 points
    - `1 conference` -> 10 points
3.  **Section 10c:**
    - `selectedOption == 'scopus'`:
        - Let `indexedPapers` = count of indexed papers.
        - Let `totalJournals` = count of all journals published (from above).
        - If `totalJournals > 0` and `indexedPapers > 0`, `Score = Min((indexedPapers / totalJournals) * 40, 40)`
    - `selectedOption == 'chapters'`:
        - Chapters `>= 5` -> 40 points
        - Chapters `4` -> 35 points
        - Chapters `3` -> 30 points
        - Chapters `2` -> 25 points
        - Chapters `1` -> 20 points
    - `selectedOption == 'books'`:
        - Status `two_plus` -> 40 points
        - Status `one` -> 35 points
        - Status `authored` -> 30 points
4.  **Proposal Status:**
    - If `submitted` -> 20 points
5.  **Project Amount:**
    - `above_4L` -> 30 points
    - `1L_to_4L` -> 25 points
    - `below_1L` -> 20 points
6.  **Consultancy Amount:**
    - `above_1L` -> 20 points
    - `below_1L` -> 15 points
7.  **Patent Status:**
    - `awarded` -> 20 points
    - `applied` -> 15 points

**Note:** The total score for Part III is capped at a maximum of **170**.

---

## Part IV: Administration & Contribution (Max 180 points)
All points in this section are mostly user-inputted performance scores on specific criteria or selected dropdown options.
1.  **Direct Float Scores (Inputs 13a to 14b):**
    - Punctuality (`13a`)
    - Behavior (`13b`)
    - Performance (`13c`)
    - Culture (`13d`)
    - Mentoring (`13e`)
    - Teamwork (`13f`)
    - Preparedness (`14a`)
    - Assessment (`14b`)
    - *The values input for the above fields are parsed to floats and summed directly.*
2.  **Activities (14c):**
    - `co_collab` -> 20 points
    - `co_ind` -> 15 points
    - `extra_collab` -> 10 points
3.  **Responsibilities (15a):**
    - If `yes` -> 20 points

**Note:** The total score for Part IV is capped at a maximum of **180**.

---

## HOD Review Processing
The HOD evaluates the same parameters in their `HodReview` screen:
- The HOD's calculations run via the exact same logic.
- They see the original Faculty Self-Rating (`SR Score`) vs. their inputted rating (`HR Score`).
- Once finalized, the HOD's input determines the updated `HR Score` values which replace the SR Score for the finalized `Grand API Score`.

---

## Principal Dashboard Categorization
After the HOD finalizes the review, the Principal views the appraisal. Each appraisal is categorized (A through F) based on the `HR Score` (HOD Rating Score) converted to a percentage, and the `Grand API Score`.

Calculations used for categorization:
- `P2_Percent = (Part 2 HR Score / 350) * 100`
- `P3_Percent = (Part 3 HR Score / 170) * 100`
- `P4_Percent = (Part 4 HR Score / 180) * 100`

### Categories:
- **Category A:** P2 >= 60%, P3 >= 60%, P4 >= 60%, Grand Score >= 70
- **Category B:** P2 >= 50%, P3 >= 50%, P4 >= 50%, Grand Score >= 60
- **Category C:** P2 >= 50%, P3 <= 50%, P4 >= 50%, Grand Score >= 55
- **Category D:** P2 >= 50%, P3 >= 50%, P4 <= 50%, Grand Score >= 50
- **Category E:** P2 >= 50%, P3 <= 50%, P4 <= 50%, Grand Score >= 40
- **Category F:** P2 <= 50%, P3 <= 50%, P4 <= 50%

### Best Faculty Determination (Per Department)
The Principal Dashboard also identifies the "Best Faculty" for each department.
To be eligible:
1.  The Part II HR Percentage must be **> 75%** (`(Part 2 HR Score / 350) * 100 > 75`).
2.  The Final Grand API Score must be **> 75**.

Among all eligible faculties in a given department, the faculty with the **highest Grand API Score** is designated as the "Best Faculty" for that department.
