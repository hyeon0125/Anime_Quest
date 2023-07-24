CREATE TABLE AnimeDB_1 AS
SELECT AnimeDB.*
FROM AnimeDB
    LEFT JOIN (
        SELECT MIN(ID) AS ID, SERIES_ID
        FROM AnimeDB
        WHERE SERIES_ID IS NOT NULL
        GROUP BY
            SERIES_ID
    ) t ON AnimeDB.ID = t.ID
    AND AnimeDB.SERIES_ID = t.SERIES_ID
WHERE
    t.ID IS NOT NULL
    OR AnimeDB.SERIES_ID IS NULL;