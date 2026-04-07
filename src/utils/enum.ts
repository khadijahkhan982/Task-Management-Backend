export enum Role {
    ADMIN = 'admin',
    MANAGER = 'manager',
    EMPLOYEE = 'employee'
}


export enum Statuses {
    TODO = 'todo',
    IN_PROGRESS = 'in_progress',
    DONE = 'done'
}

export enum Priority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high'
}


export enum Action{
    CREATED = 'created',
    UPDATED = 'updated',
    DELETED = 'deleted',
    COMMENTED = 'commented',
    ASSIGNED = 'assigned',
    UNASSIGNED = 'unassigned',
    STATUS_CHANGED = 'status_changed',
  

}

export enum HttpStatusCode {
    OK = 200,
    CREATED = 201,
    BAD_REQUEST = 400,
    NOT_FOUND = 404,
    INTERNAL_SERVER = 500,
    UNAUTHORIZED = 401,
    UNPROCESSABLE_ENTITY = 422,
    CONFLICT = 409
}