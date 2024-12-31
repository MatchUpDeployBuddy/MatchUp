-- Policy: Öffentliches Lesen von Profilbildern erlauben
CREATE POLICY "Public read access for profile pictures"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'profile_pictures' AND
    auth.role() = 'authenticated'
  );

-- Policy: Authentifizierte Benutzer dürfen eigene Profilbilder hochladen
CREATE POLICY "Authenticated insert for own profile picture"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'profile_pictures' AND
    auth.role() = 'authenticated' AND
    name LIKE (auth.uid() || '.%')  -- Dateiname beginnt mit user_id und beliebiger Erweiterung
  );

-- Policy: Authentifizierte Benutzer dürfen ihre eigenen Profilbilder aktualisieren
CREATE POLICY "Authenticated update for own profile picture"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'profile_pictures' AND
    auth.role() = 'authenticated' AND
    name LIKE (auth.uid() || '.%')
  );

  -- Policy: Authentifizierte Benutzer dürfen ihre eigenen Profilbilder löschen
CREATE POLICY "Authenticated delete for own profile picture"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'profile_pictures' AND
    auth.role() = 'authenticated' AND
    name LIKE (auth.uid() || '.%')
  );