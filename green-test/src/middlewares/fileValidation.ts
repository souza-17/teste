import { Request, Response, NextFunction } from "express";
import path from "path";

export const validateFileExtension = (extensions: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Verifica se o arquivo foi enviado
    if (!req.file) {
      res.status(400).json({ error: "Arquivo não enviado." });
      return;
    }
    // Obtém a extensão do arquivo enviado, convertendo para letras minúsculas
    const ext = path.extname(req.file.originalname).toLowerCase();

    // Verifica se a extensão está na lista de extensões permitidas
    if (!extensions.includes(ext)) {
      res.status(400).json({ error: `Extensão inválida. Permitidas: ${extensions.join(", ")}` });
      return;
    }
    // Se estiver tudo OK, passa para o próximo middleware ou controller
    next();
  };
};
