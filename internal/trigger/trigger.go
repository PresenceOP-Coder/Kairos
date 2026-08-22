package trigger

type Trigger interface {
	ShouldApply() bool
}