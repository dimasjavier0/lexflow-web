import { Alert, Button, Modal } from "../../components/ui";
import { useAuth } from "../../contexts/auth-context";
import { useAsyncAction } from "../../hooks/use-async-action";

type DeleteAccountModalProps = { onClose: () => void };

/** Asks before deleting the learner's account, spelling out everything that goes with it. */
export function DeleteAccountModal({ onClose }: DeleteAccountModalProps) {
  const { deleteAccount } = useAuth();
  const remove = useAsyncAction();

  return (
    <Modal title="¿Eliminar tu cuenta?" eyebrow="Cuenta" onClose={onClose}>
      <div className="grid gap-4">
        <p className="m-0 text-sm">Se borrarán de inmediato:</p>
        <ul className="m-0 grid list-disc gap-1 pl-5 text-sm">
          <li>Tu inicio de sesión con Google o Facebook en LexFlow.</li>
          <li>Tu perfil: nombre, foto, correo y país.</li>
          <li>Tu progreso: palabras, repasos, puntos, nivel y racha.</li>
          <li>Tus amistades en LexFlow: dejarás de aparecer en la lista de tus amigos.</li>
        </ul>
        <p className="m-0 text-sm text-muted">Esta acción no se puede deshacer. Si vuelves a entrar, empezarás con una cuenta nueva.</p>
        {remove.error ? <Alert>{remove.error}</Alert> : null}
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button variant="secondary" disabled={remove.isPending} onClick={onClose}>Cancelar</Button>
          <Button variant="danger" isLoading={remove.isPending} loadingLabel="Eliminando..." onClick={() => void remove.run(deleteAccount, "No se pudo eliminar tu cuenta.")}>
            Sí, eliminar mi cuenta
          </Button>
        </div>
      </div>
    </Modal>
  );
}
