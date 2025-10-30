-- CreateTable
CREATE TABLE "KategoriDokumen" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nama" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "folderId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "KategoriDokumen_nama_key" ON "KategoriDokumen"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "KategoriDokumen_slug_key" ON "KategoriDokumen"("slug");
